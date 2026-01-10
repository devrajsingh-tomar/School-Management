import { getEnquiryById } from "@/lib/actions/enquiry.actions";
import EnquiryDetails from "@/components/admissions/EnquiryDetails";
import { notFound } from "next/navigation";

export default async function EnquiryDetailsPage({ params }: { params: { id: string } }) {
    // Await the entire params object first
    const resolvedParams = await Promise.resolve(params);
    const enquiry = await getEnquiryById(resolvedParams.id);

    if (!enquiry) {
        notFound();
    }

    return <EnquiryDetails enquiry={enquiry} />;
}
