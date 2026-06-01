Garamatic Demo Flow
Scenario
A customer creates a support ticket through the frontend.
The system processes the ticket through multiple independent services using RabbitMQ events.

1. Customer Creates Ticket
Demo
•	Open frontend ticket form
•	Fill in data
•	Submit ticket
What happens
•	Frontend calls Ticket Masala
•	Ticket Masala publishes ticket.created

2. RabbitMQ Processes Event
Demo
•	Show RabbitMQ dashboard briefly
•	Show message/event flow
Explain
RabbitMQ acts as the communication hub between services.

3. Mailing Service Sends Confirmation
Demo
•	Show mailing service logs
•	Show confirmation email received
Explain
The mailing service listens for ticket.created events and automatically sends emails.

4. Ticket Gets Assigned
Demo
•	Assign technician to ticket in Ticket Masala
•	Trigger ticket.assigned
Result
•	Mailing service sends assignment email

5. Ticket Gets Resolved
Demo
•	Resolve ticket in ticket masala
•	Trigger ticket.resolved
Explain
Resolving a ticket emits another business event.

6. Invoice Automatically Created in Odoo
Demo
•	Show invoice appearing in Odoo
Explain
The Invoice Service listens for ticket.resolved and creates an invoice automatically in Odoo.

7. Invoice Email Sent
Demo
•	Show invoice email received
Explain
After invoice creation, an invoice.created event is published and the mailing service sends the invoice email.
