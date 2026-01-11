"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function BookList({ books }: { books: any[] }) {
    if (books.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No books found in library.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Shelf</TableHead>
                        <TableHead className="text-right">Availability</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {books.map((book) => (
                        <TableRow key={book._id}>
                            <TableCell className="font-medium">{book.title}</TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell>{book.category || "-"}</TableCell>
                            <TableCell>{book.shelfLocation || "-"}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={book.availableCopies > 0 ? "outline" : "destructive"}>
                                    {book.availableCopies} / {book.totalCopies}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
