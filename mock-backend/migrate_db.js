#!/usr/bin/env node
/**
 * Database Migration Script
 * Standardizes db.json to use snake_case consistently
 * Fixes mixed camelCase/snake_case field names from old records
 */

const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "db.json");

// Backup original db.json
function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(__dirname, `db.backup.${timestamp}.json`);

    try {
        const data = fs.readFileSync(dbPath, "utf-8");
        fs.writeFileSync(backupPath, data);
        console.log(`✅ Backup created: ${backupPath}`);
        return true;
    } catch (error) {
        console.error(`❌ Backup failed: ${error.message}`);
        return false;
    }
}

// Standardize user record
function standardizeUser(user) {
    const standardized = { ...user };

    // Fix field names
    if (standardized.name && !standardized.full_name) {
        standardized.full_name = standardized.name;
        delete standardized.name;
    }

    if (standardized.role && !standardized.roles) {
        standardized.roles = Array.isArray(standardized.role)
            ? standardized.role
            : [standardized.role];
        delete standardized.role;
    }

    if (standardized.createdAt && !standardized.created_at) {
        standardized.created_at = standardized.createdAt;
        delete standardized.createdAt;
    }

    if (standardized.updatedAt && !standardized.updated_at) {
        standardized.updated_at = standardized.updatedAt;
        delete standardized.updatedAt;
    }

    // Ensure all timestamp fields are ISO strings
    if (standardized.created_at && typeof standardized.created_at === "string") {
        standardized.created_at = new Date(standardized.created_at).toISOString();
    }

    if (standardized.updated_at && typeof standardized.updated_at === "string") {
        standardized.updated_at = new Date(standardized.updated_at).toISOString();
    }

    return standardized;
}

// Standardize order record
function standardizeOrder(order) {
    const standardized = { ...order };

    if (standardized.updatedAt && !standardized.updated_at) {
        standardized.updated_at = standardized.updatedAt;
        delete standardized.updatedAt;
    }

    return standardized;
}

// Standardize review record
function standardizeReview(review) {
    const standardized = { ...review };

    // Some reviews might have camelCase fields
    if (standardized.foodId && !standardized.food_id) {
        standardized.food_id = standardized.foodId;
        delete standardized.foodId;
    }

    if (standardized.restaurantId && !standardized.restaurant_id) {
        standardized.restaurant_id = standardized.restaurantId;
        delete standardized.restaurantId;
    }

    if (standardized.userId && !standardized.user_id) {
        standardized.user_id = standardized.userId;
        delete standardized.userId;
    }

    if (standardized.orderId && !standardized.order_id) {
        standardized.order_id = standardized.orderId;
        delete standardized.orderId;
    }

    return standardized;
}

// Main migration function
function migrateDatabase() {
    try {
        console.log("\n🔄 Starting database migration...\n");

        // Read database
        const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

        // Track changes
        const changes = {
            users: 0,
            orders: 0,
            reviews: 0,
        };

        // Migrate users collection
        if (Array.isArray(data.users)) {
            data.users = data.users.map((user) => {
                const before = JSON.stringify(user);
                const after = JSON.stringify(standardizeUser(user));

                if (before !== after) {
                    changes.users++;
                }

                return standardizeUser(user);
            });
            console.log(`✅ Users: Fixed ${changes.users} record(s)`);
        }

        // Migrate orders collection
        if (Array.isArray(data.orders)) {
            data.orders = data.orders.map((order) => {
                const before = JSON.stringify(order);
                const after = JSON.stringify(standardizeOrder(order));

                if (before !== after) {
                    changes.orders++;
                }

                return standardizeOrder(order);
            });
            console.log(`✅ Orders: Fixed ${changes.orders} record(s)`);
        }

        // Migrate reviews collection
        if (Array.isArray(data.reviews)) {
            data.reviews = data.reviews.map((review) => {
                const before = JSON.stringify(review);
                const after = JSON.stringify(standardizeReview(review));

                if (before !== after) {
                    changes.reviews++;
                }

                return standardizeReview(review);
            });
            console.log(`✅ Reviews: Fixed ${changes.reviews} record(s)`);
        }

        // Write back to database
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

        const totalChanges = Object.values(changes).reduce((a, b) => a + b, 0);
        console.log(`\n✅ Migration complete! Fixed ${totalChanges} record(s)\n`);

        return true;
    } catch (error) {
        console.error(`\n❌ Migration failed: ${error.message}\n`);
        return false;
    }
}

// Main execution
async function main() {
    console.log("📋 Database Migration Tool");
    console.log("===========================");

    // Backup first
    if (!backupDatabase()) {
        console.error("❌ Migration aborted - backup failed");
        process.exit(1);
    }

    // Run migration
    if (!migrateDatabase()) {
        console.error("❌ Migration failed");
        process.exit(1);
    }

    console.log("✅ All done!");
    process.exit(0);
}

main();
