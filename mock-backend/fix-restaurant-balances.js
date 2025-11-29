const fs = require('fs');
const path = require('path');

// Read db.json
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('🔍 Analyzing restaurant balances vs actual orders...\n');

// Calculate actual revenue from delivered orders
const restaurantRevenue = {};

db.orders.forEach(order => {
    if (order.status === 'delivered' && order.restaurant_id) {
        if (!restaurantRevenue[order.restaurant_id]) {
            restaurantRevenue[order.restaurant_id] = {
                total_earned: 0,
                order_count: 0,
                orders: []
            };
        }

        // Add order total to restaurant revenue
        const amount = order.total_amount || 0;
        restaurantRevenue[order.restaurant_id].total_earned += amount;
        restaurantRevenue[order.restaurant_id].order_count += 1;
        restaurantRevenue[order.restaurant_id].orders.push({
            order_number: order.order_number,
            amount: amount,
            created_at: order.created_at
        });
    }
});

console.log('📊 Actual Revenue by Restaurant:\n');
Object.keys(restaurantRevenue).forEach(restaurantId => {
    const restaurant = db.restaurants.find(r => r.id === restaurantId);
    const revenue = restaurantRevenue[restaurantId];

    console.log(`${restaurant?.name || restaurantId}:`);
    console.log(`  - Orders delivered: ${revenue.order_count}`);
    console.log(`  - Total earned: ${revenue.total_earned.toLocaleString('vi-VN')}₫`);
    console.log('');
});

// Calculate total withdrawals by restaurant
const restaurantWithdrawals = {};
db.withdrawals.forEach(withdrawal => {
    if (withdrawal.status === 'approved') {
        if (!restaurantWithdrawals[withdrawal.restaurant_id]) {
            restaurantWithdrawals[withdrawal.restaurant_id] = {
                total_withdrawn: 0,
                count: 0
            };
        }
        restaurantWithdrawals[withdrawal.restaurant_id].total_withdrawn += withdrawal.amount;
        restaurantWithdrawals[withdrawal.restaurant_id].count += 1;
    }
});

console.log('\n💰 Total Approved Withdrawals by Restaurant:\n');
Object.keys(restaurantWithdrawals).forEach(restaurantId => {
    const restaurant = db.restaurants.find(r => r.id === restaurantId);
    const withdrawals = restaurantWithdrawals[restaurantId];

    console.log(`${restaurant?.name || restaurantId}:`);
    console.log(`  - Withdrawals: ${withdrawals.count}`);
    console.log(`  - Total withdrawn: ${withdrawals.total_withdrawn.toLocaleString('vi-VN')}₫`);
    console.log('');
});

// Build new restaurant_balances based on actual data
const newBalances = [];
const now = new Date().toISOString();

Object.keys(restaurantRevenue).forEach(restaurantId => {
    const earned = restaurantRevenue[restaurantId].total_earned;
    const withdrawn = restaurantWithdrawals[restaurantId]?.total_withdrawn || 0;
    const available = earned - withdrawn;

    newBalances.push({
        restaurant_id: restaurantId,
        available_balance: available,
        total_earned: earned,
        total_withdrawn: withdrawn,
        last_updated: now
    });
});

console.log('\n✅ New Restaurant Balances (calculated from actual orders):\n');
newBalances.forEach(balance => {
    const restaurant = db.restaurants.find(r => r.id === balance.restaurant_id);
    console.log(`${restaurant?.name || balance.restaurant_id}:`);
    console.log(`  - Total earned: ${balance.total_earned.toLocaleString('vi-VN')}₫`);
    console.log(`  - Total withdrawn: ${balance.total_withdrawn.toLocaleString('vi-VN')}₫`);
    console.log(`  - Available balance: ${balance.available_balance.toLocaleString('vi-VN')}₫`);
    console.log('');
});

// Find invalid withdrawals (exceeding actual revenue)
console.log('\n⚠️  Checking for invalid withdrawals...\n');
const invalidWithdrawals = [];

db.withdrawals.forEach(withdrawal => {
    const revenue = restaurantRevenue[withdrawal.restaurant_id];
    const totalWithdrawn = restaurantWithdrawals[withdrawal.restaurant_id]?.total_withdrawn || 0;

    if (!revenue) {
        console.log(`❌ ${withdrawal.id}: Restaurant ${withdrawal.restaurant_id} has no delivered orders`);
        invalidWithdrawals.push(withdrawal.id);
    } else if (withdrawal.status === 'pending') {
        const availableBalance = revenue.total_earned - totalWithdrawn;
        if (withdrawal.amount > availableBalance) {
            console.log(`❌ ${withdrawal.id}: Amount ${withdrawal.amount.toLocaleString('vi-VN')}₫ exceeds available ${availableBalance.toLocaleString('vi-VN')}₫`);
            invalidWithdrawals.push(withdrawal.id);
        }
    }
});

if (invalidWithdrawals.length === 0) {
    console.log('✅ All withdrawals are valid!\n');
}

// Ask for confirmation before updating
console.log('\n📝 Summary of changes:');
console.log(`  - Will update ${newBalances.length} restaurant balance records`);
console.log(`  - Will remove ${invalidWithdrawals.length} invalid withdrawal requests`);
console.log('\n⚠️  WARNING: This will modify db.json!');
console.log('Press Ctrl+C to cancel, or run with --apply flag to apply changes\n');

if (process.argv.includes('--apply')) {
    // Update db.json
    db.restaurant_balances = newBalances;

    // Remove invalid withdrawals
    db.withdrawals = db.withdrawals.filter(w => !invalidWithdrawals.includes(w.id));

    // Write back to db.json
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

    console.log('✅ Database updated successfully!');
    console.log('   - restaurant_balances: Updated with actual revenue data');
    console.log(`   - withdrawals: Removed ${invalidWithdrawals.length} invalid requests`);
} else {
    console.log('ℹ️  Run with --apply flag to apply changes: node fix-restaurant-balances.js --apply');
}
