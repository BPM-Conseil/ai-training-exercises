const { formatDistanceToNowStrict } = require('date-fns');

// Using formatDistanceToNowStrict which was added in date-fns 2.0.0
// This will FAIL with date-fns 1.30.1 because formatDistanceToNowStrict doesn't exist!

const eventDate = new Date('2024-01-01');

console.log('Event date:', eventDate);

// Calculate time distance using formatDistanceToNowStrict
// This function doesn't exist in date-fns 1.30.1
const timeAgo = formatDistanceToNowStrict(eventDate);

console.log('Time since event:', timeAgo);
