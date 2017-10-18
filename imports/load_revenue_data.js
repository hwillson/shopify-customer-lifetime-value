/* eslint-disable no-console */

import csvParse from 'csv-parse/lib/sync';
import fs from 'fs';

import subscriptionRevenueCollection from './collection';

// "Email", "Financial Status", "Total", "Created at", "Lineitem sku", "Id",
// "Tags"
const COLUMNS = {
  email: 0,
  financialStatus: 1,
  total: 2,
  createdAt: 3,
  sku: 4,
  orderId: 5,
  tags: 6,
};

const saveOrder = (order) => {
  subscriptionRevenueCollection.insert({
    orderId: order.id,
    orderDate: order.date,
    orderTotal: order.total,
    customerEmail: order.email,
  });
};

const isFirstSubscriptionOrder = (order, line) =>
  order && line[COLUMNS.sku].indexOf('TF_SUB') > -1;

const isRenewalOrder = (order, line) =>
  order && line[COLUMNS.tags].indexOf('subscription_renewal_order') > -1;

export default function loadRevenueData() {
  console.log('[START] Loading revenue data ...');

  const csvData = fs.readFileSync('/tmp/data.csv').toString();
  const csv = csvParse(csvData);

  let order;
  csv.forEach((line, index) => {
    if (line[COLUMNS.financialStatus] === 'paid') {
      order = {
        id: line[COLUMNS.orderId],
        date: new Date(line[COLUMNS.createdAt]),
        total: +line[COLUMNS.total],
        email: line[COLUMNS.email],
      };
    }

    if (isFirstSubscriptionOrder(order, line) || isRenewalOrder(order, line)) {
      saveOrder(order);
      order = null;
    }

    console.log(`Processed row ${index + 1}/${csv.length} ...`);
  });

  console.log('[STOP] Done.');
}
