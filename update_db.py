#!/usr/bin/env python3
import json
from collections import defaultdict

# Load db.json
with open('./mock-backend/db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Calculate sold count for each menu item from orders
menu_sold = defaultdict(int)

for order in db.get('orders', []):
    # Only count delivered orders
    if order.get('status') in ['delivered', 'completed']:
        for item in order.get('items', []):
            menu_id = item.get('menu_id')
            quantity = item.get('quantity', 1)
            menu_sold[menu_id] += quantity

# Update menu items with calculated sold count
for item in db.get('menus', []):
    menu_id = item.get('id')
    # Remove hard-coded sold, use calculated value
    item['sold'] = menu_sold.get(menu_id, 0)
    # Keep rating (can add reviews/comments later for dynamic rating)

# Save updated db.json
with open('./mock-backend/db.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print(f"Updated {len(db.get('menus', []))} menu items with actual sold count from orders")
print("\nSold count summary:")
total_sold = sum(menu_sold.values())
for item in db.get('menus', [])[:5]:
    print(f"  {item['name']}: {item['sold']} sold")
print(f"...\nTotal items sold: {total_sold}")
