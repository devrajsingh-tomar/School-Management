import connectDB from '../src/lib/db/connect';
import User from '../src/lib/db/models/User';

async function main() {
    await connectDB();
    const users = await User.find({}).lean();
    console.log('Users:', users);
    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
