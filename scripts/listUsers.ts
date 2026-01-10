import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

async function main() {
    await connectDB();
    const users = await User.find({}).lean();
    console.log('Users:', users);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
