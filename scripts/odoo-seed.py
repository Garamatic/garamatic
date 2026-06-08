#!/usr/bin/env python3
"""
Seed Odoo with demo data for the civic demo.
Creates:
- account.account (income account, code 7000)
- res.partner (Jean Dupont, Marie Curie, Pierre Martin)

Run this script AFTER Odoo has started and the base+account modules are installed.
"""

import xmlrpc.client
import time
import sys

URL = 'http://localhost:8069'
DB = 'odoo'
USERNAME = 'admin'
PASSWORD = 'admin'


def wait_for_odoo(max_attempts=60):
    for i in range(max_attempts):
        try:
            common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
            common.version()
            print(f"Odoo is ready (attempt {i+1})")
            return True
        except Exception:
            print(f"Waiting for Odoo... {i+1}/{max_attempts}")
            time.sleep(2)
    return False


def main():
    if not wait_for_odoo():
        print("Odoo not ready, skipping seed")
        sys.exit(1)

    common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
    uid = common.authenticate(DB, USERNAME, PASSWORD, {})
    if not uid:
        print("Authentication failed")
        sys.exit(1)

    models = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/object')

    # Get default company
    company_ids = models.execute_kw(DB, uid, PASSWORD, 'res.company', 'search', [[]])
    if not company_ids:
        print("No company found")
        sys.exit(1)
    company_id = company_ids[0]

    # Create income account (code 7000)
    accounts = models.execute_kw(
        DB, uid, PASSWORD, 'account.account', 'search',
        [[['code', '=', '7000']]]
    )
    if not accounts:
        account_id = models.execute_kw(
            DB, uid, PASSWORD, 'account.account', 'create',
            [[{
                'code': '7000',
                'name': 'Verkoop',
                'account_type': 'income',
                'company_id': company_id,
            }]]
        )
        print(f"Created account.account with ID {account_id}")
    else:
        account_id = accounts[0]
        print(f"Account already exists: {account_id}")

    # Create customers — matches demo/config/seed_data.json and data-desgoffe/
    customers = [
        {
            'name': 'Jean Dupont',
            'email': 'jean.dupont@citoyen.be',
            'phone': '+32 471 23 45 67',
        },
        {
            'name': 'Marie Curie',
            'email': 'marie.curie@science.be',
            'phone': '+32 472 34 56 78',
        },
        {
            'name': 'Pierre Martin',
            'email': 'pierre.martin@entreprise.be',
            'phone': '+32 473 45 67 89',
        },
        {
            'name': 'Sophie Bernard',
            'email': 'sophie.bernard@ecole.be',
            'phone': '+32 474 56 78 90',
        },
        {
            'name': 'Emma Roux',
            'email': 'emma.roux@associations.be',
            'phone': '+32 476 78 90 12',
        },
        {
            'name': 'Antoine Moreau',
            'email': 'antoine.moreau@retraite.be',
            'phone': '+32 477 89 01 23',
        },
    ]

    for customer in customers:
        partners = models.execute_kw(
            DB, uid, PASSWORD, 'res.partner', 'search',
            [[['email', '=', customer['email']]]]
        )
        if not partners:
            partner_id = models.execute_kw(
                DB, uid, PASSWORD, 'res.partner', 'create',
                [[{
                    'name': customer['name'],
                    'email': customer['email'],
                    'phone': customer['phone'],
                    'customer_rank': 1,
                    'is_company': False,
                }]]
            )
            print(f"Created partner {customer['name']} with ID {partner_id}")
        else:
            print(f"Partner {customer['name']} already exists: {partners[0]}")

    print("Odoo seeding complete")


if __name__ == '__main__':
    main()
