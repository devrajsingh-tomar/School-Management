import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddBookForm } from "@/components/forms/add-book-form";
import { BookList } from "@/components/library/book-list";
import { IssueBookForm } from "@/components/forms/issue-book-form";
import { ActiveIssuesTable } from "@/components/library/active-issues-table";
import { getBooks, getActiveIssues } from "@/lib/actions/library.actions";
import { getSchoolUsers } from "@/lib/actions/user.actions";
import connectDB from "@/lib/db/connect";

export default async function LibraryPage() {
    const session = await auth();
    if (!session?.user || !session.user.schoolId) redirect("/login");

    await connectDB();

    const [booksRes, issuesRes, users] = await Promise.all([
        getBooks(session.user.schoolId),
        getActiveIssues(session.user.schoolId),
        getSchoolUsers(),
    ]);

    const books = booksRes.success ? booksRes.data : [];
    const issues = issuesRes.success ? issuesRes.data : [];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Library Management</h2>
            </div>

            <Tabs defaultValue="books" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="books">Books Inventory</TabsTrigger>
                    <TabsTrigger value="issues">Issue & Return</TabsTrigger>
                </TabsList>

                <TabsContent value="books" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Book Inventory</CardTitle>
                                <CardDescription>
                                    List of all books in the library.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BookList books={books} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Add New Book</CardTitle>
                                <CardDescription>
                                    Register a new book to the database.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AddBookForm
                                    schoolId={session.user.schoolId}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="issues" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 lg:col-span-5">
                            <CardHeader>
                                <CardTitle>Active Issues</CardTitle>
                                <CardDescription>
                                    Books currently issued to students/staff.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ActiveIssuesTable issues={issues} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Issue Book</CardTitle>
                                <CardDescription>
                                    Issue a book to a user.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <IssueBookForm
                                    books={books}
                                    users={users}
                                    schoolId={session.user.schoolId}
                                    issuerId={session.user.id}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
