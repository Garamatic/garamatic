#!/usr/bin/env python3
"""
Heartbeat Monitor — Consumes heartbeats and tracks service status.

Exposes a simple HTTP endpoint with current status.

Usage:
    python heartbeat-monitor.py

Endpoint:
    GET /health → overall health status
    GET /status → JSON with all service statuses
"""

import json
import os
import sys
import time
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

import pika

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "guest")
TIMEOUT_SECONDS = float(os.getenv("HEARTBEAT_TIMEOUT", "3.0"))

# Global state: last seen heartbeat per service
last_seen = {}
status_lock = threading.Lock()


def connect_rabbitmq():
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        credentials=credentials,
        heartbeat=30,
        blocked_connection_timeout=10,
    )
    return pika.BlockingConnection(parameters)


def update_status(service_name, timestamp):
    with status_lock:
        last_seen[service_name] = timestamp
        print(f"[monitor] {service_name} — alive @ {datetime.fromtimestamp(timestamp).strftime('%H:%M:%S')}")


def get_service_status():
    with status_lock:
        now = time.time()
        result = {}
        for service, ts in last_seen.items():
            age = now - ts
            if age < TIMEOUT_SECONDS:
                result[service] = {"status": "up", "last_seen": ts, "age_seconds": round(age, 1)}
            else:
                result[service] = {"status": "down", "last_seen": ts, "age_seconds": round(age, 1)}
        return result


def consume_heartbeats():
    retry_delay = 1.0
    max_retry_delay = 30.0

    while True:
        try:
            connection = connect_rabbitmq()
            channel = connection.channel()
            channel.exchange_declare(exchange="heartbeat", exchange_type="fanout", durable=True)
            result = channel.queue_declare(queue="", exclusive=True)
            queue_name = result.method.queue
            channel.queue_bind(exchange="heartbeat", queue=queue_name)

            print("Heartbeat monitor started")
            print(f"Timeout: {TIMEOUT_SECONDS}s | RabbitMQ: {RABBITMQ_HOST}:{RABBITMQ_PORT}")
            retry_delay = 1.0  # Reset on successful connection

            def callback(ch, method, properties, body):
                try:
                    msg = json.loads(body)
                    service_name = msg.get("service", "unknown")
                    timestamp = msg.get("timestamp", time.time())
                    update_status(service_name, timestamp)
                except Exception as e:
                    print(f"[monitor] Error processing message: {e}")

            channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as e:
            print(f"[monitor] RabbitMQ connection failed: {e}")
            print(f"[monitor] Retrying in {retry_delay}s...")
            time.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, max_retry_delay)
        except Exception as e:
            print(f"[monitor] Unexpected error: {e}")
            print(f"[monitor] Retrying in {retry_delay}s...")
            time.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, max_retry_delay)


class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/" or self.path == "/simple":
            # Serve the simple UI
            try:
                with open("/app/simple.html", "r") as f:
                    html = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(html.encode())
            except FileNotFoundError:
                self.send_response(404)
                self.send_header("Content-Type", "text/plain")
                self.end_headers()
                self.wfile.write(b"simple.html not found")
        elif self.path == "/health":
            status = get_service_status()
            all_up = all(s["status"] == "up" for s in status.values())
            code = 200 if all_up else 503
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "healthy" if all_up else "unhealthy",
                "services": status,
                "timestamp": time.time(),
            }).encode())
        elif self.path == "/status":
            status = get_service_status()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "services": status,
                "timestamp": time.time(),
                "count_up": sum(1 for s in status.values() if s["status"] == "up"),
                "count_down": sum(1 for s in status.values() if s["status"] == "down"),
            }).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress logs


def run_http_server():
    port = int(os.getenv("PORT", "8080"))
    server = HTTPServer(("0.0.0.0", port), RequestHandler)
    print(f"HTTP server listening on port {port}")
    server.serve_forever()


if __name__ == "__main__":
    # Start consumer in background thread
    consumer_thread = threading.Thread(target=consume_heartbeats, daemon=True)
    consumer_thread.start()

    # Run HTTP server in main thread
    run_http_server()
