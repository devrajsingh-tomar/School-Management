"use server";

import { connectDB } from "@/lib/db/connect";
import Book from "@/lib/db/models/Book";
import LibraryTransaction from "@/lib/db/models/LibraryTransaction";
import User from "@/lib/db/models/User";
import { revalidatePath } from "next/cache";

// --- Book Actions ---

export async function createBook(data: {
    schoolId: string;
    title: string;
    author: string;
    isbn?: string;
    category?: string;
    totalCopies: number;
    shelfLocation?: string;
}) {
    try {
        await connectDB();
        const availableCopies = data.totalCopies;
        const newBook = await Book.create({
            school: data.schoolId,
            ...data,
            availableCopies,
        });
        revalidatePath("/school/library");
        return { success: true, data: JSON.parse(JSON.stringify(newBook)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getBooks(schoolId: string, search?: string) {
    try {
        await connectDB();
        const query: any = { school: schoolId };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { author: { $regex: search, $options: "i" } },
                { isbn: { $regex: search, $options: "i" } },
            ];
        }
        const books = await Book.find(query).sort({ title: 1 });
        return { success: true, data: JSON.parse(JSON.stringify(books)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Transaction Actions ---

export async function issueBook(data: {
    schoolId: string;
    bookId: string;
    userId: string;
    issuedById: string;
    expectedReturnDate: Date;
}) {
    try {
        await connectDB();

        // 1. Check book availability
        const book = await Book.findById(data.bookId);
        if (!book) return { success: false, error: "Book not found" };
        if (book.availableCopies < 1) return { success: false, error: "No copies available" };

        // 2. Check user
        const user = await User.findById(data.userId);
        if (!user) return { success: false, error: "User not found" };

        // 3. Create Transaction
        const transaction = await LibraryTransaction.create({
            school: data.schoolId,
            book: data.bookId,
            user: data.userId,
            issuedBy: data.issuedById,
            issueDate: new Date(),
            dueDate: data.expectedReturnDate,
            status: "Issued",
        });

        // 4. Update Book stock
        book.availableCopies -= 1;
        await book.save();

        revalidatePath("/school/library");
        return { success: true, data: JSON.parse(JSON.stringify(transaction)) };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function returnBook(transactionId: string) {
    try {
        await connectDB();

        const transaction = await LibraryTransaction.findById(transactionId);
        if (!transaction) return { success: false, error: "Transaction not found" };
        if (transaction.status === "Returned") return { success: false, error: "Already returned" };

        // 1. Update Transaction
        transaction.status = "Returned";
        transaction.returnDate = new Date();
        await transaction.save();

        // 2. Update Book stock
        await Book.findByIdAndUpdate(transaction.book, {
            $inc: { availableCopies: 1 }
        });

        revalidatePath("/school/library");
        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getActiveIssues(schoolId: string) {
    try {
        await connectDB();
        const issues = await LibraryTransaction.find({
            school: schoolId,
            status: { $in: ["Issued", "Overdue"] }
        })
            .populate("book", "title author")
            .populate("user", "name role class section") // populating class/section might need deep populate if standard schema, but User usually has these as IDs.
            .sort({ issueDate: -1 });

        // Populate Class/Section name for User if IDs are present (optimization: do this on client or improved schema)
        // For now, let's just return basic User info. 

        return { success: true, data: JSON.parse(JSON.stringify(issues)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
