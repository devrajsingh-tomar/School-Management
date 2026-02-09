import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface PrimaryActionButtonProps extends ButtonProps {
    children: React.ReactNode;
}

export function PrimaryActionButton({ children, className, ...props }: PrimaryActionButtonProps) {
    return (
        <Button
            className={cn("font-semibold shadow-md", className)}
            size="default"
            {...props}
        >
            {/* If children is just a string, we could optionally add a default Plus icon, 
                but safer to stick to wrapping styles for now unless requested. 
                Use user provided content mainly. */}
            {children}
        </Button>
    );
}
