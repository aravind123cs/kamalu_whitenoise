import AiAssistant from "@/components/AiAssistant";
import SoundPlayer from "@/components/SoundPlayer";
import { sounds } from "@/lib/sounds";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-12 bg-background selection:bg-primary/30 selection:text-primary-foreground">
      <div className="w-full max-w-lg space-y-10">
        <header className="text-center pt-8">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground tracking-tight">
            Kamalu's White noise
          </h1>
          <p className="text-xl text-muted-foreground mt-3">
            Soothing sounds for peaceful sleep.
          </p>
        </header>

        <SoundPlayer sounds={sounds} />


      </div>
    </main>
  );
}
