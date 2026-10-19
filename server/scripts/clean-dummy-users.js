const mongoose = require('mongoose');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Bookmark = require('../models/Bookmark');
const Note = require('../models/Note');

async function cleanDummyUsers() {
  await mongoose.connect('mongodb://127.0.0.1:27017/datadrix');
  console.log('Connected to MongoDB');

  // Protect all real accounts (including root admin & organization owner)
  const protectedEmails = ['codernitin55@gmail.com', 'admin@datadrix.com'];

  // Identify dummy, demo, or placeholder accounts
  const dummyUsers = await User.find({
    $or: [
      { email: 'student@datadrix.com' },
      { email: /^test/i },
      { email: /^demo/i },
      { name: /^Demo/i },
      { $and: [{ email: null }, { phone: null }] }
    ]
  });

  console.log(`Found ${dummyUsers.length} dummy/test user(s) to remove:`);
  for (const u of dummyUsers) {
    if (u.email && protectedEmails.includes(u.email.toLowerCase())) continue;

    console.log(` - Removing: "${u.name}" (${u.email || u.phone || 'no contact'}) [${u._id}]`);
    await Promise.all([
      Progress.deleteMany({ userId: u._id }),
      Bookmark.deleteMany({ userId: u._id }),
      Note.deleteMany({ userId: u._id }),
      User.findByIdAndDelete(u._id)
    ]);
  }

  // Grant ADMIN role to codernitin55@gmail.com so Nitin has full admin access
  const nitin = await User.findOne({ email: 'codernitin55@gmail.com' });
  if (nitin) {
    nitin.role = 'admin';
    nitin.isActive = true;
    nitin.isBlocked = false;
    await nitin.save();
    console.log(`Promoted "${nitin.name}" (${nitin.email}) to Administrator.`);
  }

  // Print remaining active users in MongoDB
  const remaining = await User.find().select('name email phone role createdAt');
  console.log('\n==========================================');
  console.log('REMAINING REAL USERS IN DATABASE:');
  console.log('==========================================');
  console.log(JSON.stringify(remaining, null, 2));

  await mongoose.disconnect();
}

cleanDummyUsers().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
