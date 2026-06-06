iBenjumea Moreno Juan, De Schrijver Wito, Görtz Maarten, Schröer Charlotte 

StaVaZa Integration Project  

04.05.2026 

Realistic Scenario: Professional Ticketing System 

This section describes a realistic scenario for implementing an event-driven architecture using RabbitMQ in a professional IT or service ticketing platform. 

Example Use Cases 

    Employee reports an IT problem. 

    Customer submits a support request. 

    A technician is assigned to the issue. 

    Status updates are tracked during the resolution process. 

    Automatic email notifications are sent to customers. 

    Invoicing is generated for billable work. 

    Analytics dashboards monitor support performance. 

Core Systems in the Architecture 

    Frontend / Ticketing Tool: Users create and manage tickets. 

    CRM: Stores customer and company information and keeps service history. 

    Mailing Service: Sends notifications and updates to customers. 

    Planning System: Assigns technicians and manages scheduling. 

    Billing: Handles billable work and invoice generation.  

    Control Room / Monitoring: Monitors system health and operational statistics. 

Execution – Implementation 

    Central RabbitMQ: Started / Roll out -> https://github.com/Garamatic/ticket-masala/tree/feature/rabbit 

    Citizen Portal (React): Started -> https://github.com/Garamatic/ticket-masala-portal (React + Vite, replaced Drupal frontend)  

    Sendgrid: Locally Tested -> https://github.com/Garamatic/mailing-service  

    Odoo (Billing): Started -> https://github.com/Garamatic/odoo-integration  

    MCP: Started -> https://github.com/Garamatic/agentic-service  

Next steps by priority: 

    Citizen Portal: The React portal is functional and integrated with Ticket Masala API. Polish UI and ensure all demo flows work end-to-end. 

    Testing and integrating all workflows to validate our use cases 

    Adapt our outcomes from the tests to align with our existing work 

    Iterative process 