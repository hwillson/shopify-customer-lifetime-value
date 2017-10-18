import { Mongo } from 'meteor/mongo';
const subscriberRevenueCollection = new Mongo.Collection('subscriber_revenue');
export default subscriberRevenueCollection;
