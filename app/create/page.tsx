import { CreatePassForm } from "../dashboard/_components/form";

export default async function Dashboard() {
    return (
        <div className="flex flex-col justify-center items-center w-full h-screen p-3">
            <h1 className="text-3xl font-semibold tracking-tight mb-4">Create Pass</h1>
            <CreatePassForm />
        </div>
    );
}