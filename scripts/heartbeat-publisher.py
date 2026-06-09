#!/usr/bin/env python3
"""
Heartbeat Publisher — Simulates a heartbeat from each service every 1 second.

Usage:
    python heartbeat-publisher.py --service ticket-masala

Or run as a service to simulate all services:
    python heartbeat-publisher.py --all
"""

import argparse
import json
import os
import time
import signal
import sys

import pika

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "guest")
HEARTBEAT_INTERVAL = float(os.getenv("HEARTBEAT_INTERVAL", "1.0"))

SERVICES = [
    "ticket-masala",
    "gatekeeper-api",
    "agentic-service",
    "agentic-mcp",
    "odoo-integration",
    "mailing-service",
    "odoo",
    "odoo-db",
    "rabbitmq",
    "llama",
    "grafana",
    "prometheus",
    "loki",
    "promtail",
    "tempo",
    "cadvisor",
    "health-dashboard",
    "portal",
    "garamatic-web",
    "masala-web",
    "showcase",
    "mailhog",
]


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


def publish_heartbeat(channel, service_name):
    message = {
        "service": service_name,
        "timestamp": time.time(),
        "status": "alive",
        "host": os.uname().nodename,
    }
    channel.basic_publish(
        exchange="heartbeat",
        routing_key="",
        body=json.dumps(message).encode(),
        properties=pika.BasicProperties(content_type="application/json"),
    )
    print(f"[heartbeat] {service_name} — {time.strftime('%H:%M:%S')}", flush=True)


def run_single_service(service_name):
    connection = connect_rabbitmq()
    channel = connection.channel()
    channel.exchange_declare(exchange="heartbeat", exchange_type="fanout", durable=True)

    print(f"Heartbeat publisher started for {service_name}")
    print(f"Interval: {HEARTBEAT_INTERVAL}s | RabbitMQ: {RABBITMQ_HOST}:{RABBITMQ_PORT}")

    while True:
        try:
            publish_heartbeat(channel, service_name)
            time.sleep(HEARTBEAT_INTERVAL)
        except pika.exceptions.AMQPConnectionError:
            print("[heartbeat] Connection lost, reconnecting...")
            connection = connect_rabbitmq()
            channel = connection.channel()
            channel.exchange_declare(exchange="heartbeat", exchange_type="fanout", durable=True)


def run_all_services():
    connection = connect_rabbitmq()
    channel = connection.channel()
    channel.exchange_declare(exchange="heartbeat", exchange_type="fanout", durable=True)

    print("Heartbeat publisher started for ALL services")
    print(f"Interval: {HEARTBEAT_INTERVAL}s | RabbitMQ: {RABBITMQ_HOST}:{RABBITMQ_PORT}")
    print(f"Services: {', '.join(SERVICES)}")

    while True:
        try:
            for service in SERVICES:
                publish_heartbeat(channel, service)
                time.sleep(HEARTBEAT_INTERVAL / len(SERVICES))
        except pika.exceptions.AMQPConnectionError:
            print("[heartbeat] Connection lost, reconnecting...")
            connection = connect_rabbitmq()
            channel = connection.channel()
            channel.exchange_declare(exchange="heartbeat", exchange_type="fanout", durable=True)


def signal_handler(sig, frame):
    print("\n[heartbeat] Shutting down...")
    sys.exit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    parser = argparse.ArgumentParser(description="Heartbeat Publisher")
    parser.add_argument("--service", help="Service name to send heartbeat for")
    parser.add_argument("--all", action="store_true", help="Simulate heartbeats for all services")
    args = parser.parse_args()

    if args.all:
        run_all_services()
    elif args.service:
        run_single_service(args.service)
    else:
        print("Usage: heartbeat-publisher.py --service <name> OR --all")
        sys.exit(1)
