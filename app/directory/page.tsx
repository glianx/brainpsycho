import { CategoryDeck } from "@/components/directory/CategoryDeck";
import { Button } from "@/components/ui/button";
import { getQuestionsByCategory } from "@/lib/db/directory";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function DirectoryPage() {
    const categorizedQuestions = await getQuestionsByCategory();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-2">Question Directory</h1>
                    <p className="text-muted-foreground text-lg">
                        Explore questions organized by mathematical category
                    </p>
                </header>

                <div className="space-y-4">
                    {categorizedQuestions.map((categoryData) => (
                        <CategoryDeck key={categoryData.category} categoryData={categoryData} />
                    ))}
                </div>
            </div>
        </div>
    );
}
