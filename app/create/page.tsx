import { CreatePassForm } from "../dashboard/_components/form";
import ModeToggle from "../dashboard/_components/mode-toggle";

export default async function Dashboard() {
    return (
        <div className="flex flex-col justify-center items-center w-full h-screen p-3">
            <div className="flex items-center justify-between w-full max-w-5xl">
                <h1 className="text-3xl font-semibold tracking-tight mb-4">Apple Pass Builder</h1>
                <ModeToggle />
            </div>
            <CreatePassForm />
        </div>
    );
}