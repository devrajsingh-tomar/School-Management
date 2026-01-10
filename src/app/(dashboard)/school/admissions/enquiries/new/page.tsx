import { getClasses } from "@/lib/actions/academic.actions";
import EnquiryForm from "@/components/admissions/EnquiryForm";

export default async function NewEnquiryPage() {
    const classes = await getClasses();

    return (
        <div className="max-w-4xl mx-auto py-8">
            <EnquiryForm classes={classes} />
        </div>
    );
}
