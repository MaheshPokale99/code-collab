import FormComponent from "@/components/forms/FormComponent"

function HomePage() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-background">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-4 top-0 h-72 w-72 animate-pulse-slow rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -right-4 bottom-0 h-72 w-72 animate-pulse-slow rounded-full bg-secondary/20 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
                <div className="w-full max-w-7xl">
                    <div className="glass-panel animate-slide-up">
                        <FormComponent />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
