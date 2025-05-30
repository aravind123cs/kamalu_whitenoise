"use client";

import { suggestSleepSettings, SuggestSleepSettingsInput, SuggestSleepSettingsOutput } from "@/ai/flows/suggest-sleep-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Lightbulb } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

const aiAssistantSchema = z.object({
  babyAgeMonths: z.coerce.number().min(0).max(48).optional().default(NaN), // Optional, 0 to 48 months
  typicalSleepTimeMinutes: z.coerce.number().min(0).max(300).optional().default(NaN), // Optional, 0 to 300 minutes
  preferredSounds: z.string().optional().default(""),
});

type AiAssistantFormData = z.infer<typeof aiAssistantSchema>;

export default function AiAssistant() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<SuggestSleepSettingsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<AiAssistantFormData>({
    resolver: zodResolver(aiAssistantSchema),
    defaultValues: {
      babyAgeMonths: undefined, // Use undefined for react-hook-form to treat as empty
      typicalSleepTimeMinutes: undefined,
      preferredSounds: "",
    },
  });

  const onSubmit = async (data: AiAssistantFormData) => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const input: SuggestSleepSettingsInput = {};
      if (!isNaN(data.babyAgeMonths!)) input.babyAgeMonths = data.babyAgeMonths;
      if (!isNaN(data.typicalSleepTimeMinutes!)) input.typicalSleepTimeMinutes = data.typicalSleepTimeMinutes;
      if (data.preferredSounds) input.preferredSounds = data.preferredSounds;
      
      const result = await suggestSleepSettings(input);
      setSuggestion(result);
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get suggestion. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-semibold text-primary-foreground flex items-center justify-center">
          <Lightbulb className="w-8 h-8 mr-3 text-accent" /> AI Sleep Assistant
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Get personalized sound and timer suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="babyAgeMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Baby&apos;s Age (months, optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 6" {...field} 
                      onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                      className="text-lg h-12" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="typicalSleepTimeMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Typical Nap Time (minutes, optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 45" {...field} 
                      onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                      className="text-lg h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredSounds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Preferred Sounds (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., rain, fan" {...field} className="text-lg h-12" />
                  </FormControl>
                  <FormDescription>
                    Enter sounds your baby seems to like, separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full text-lg h-12">
              {isLoading ? "Getting suggestion..." : "Get Sleep Tip"}
              {!isLoading && <Sparkles className="ml-2 h-5 w-5" />}
            </Button>
          </form>
        </Form>
      </CardContent>
      {suggestion && (
        <>
        <Separator className="my-6" />
        <CardFooter className="flex flex-col items-start space-y-3 text-left p-6">
          <h3 className="text-xl font-semibold text-primary-foreground">Suggestion:</h3>
          <p className="text-md">
            <strong className="text-accent-foreground">Sound:</strong> {suggestion.suggestedSound}
          </p>
          <p className="text-md">
            <strong className="text-accent-foreground">Timer:</strong> {suggestion.suggestedTimerMinutes} minutes
          </p>
          <p className="text-md">
            <strong className="text-accent-foreground">Reason:</strong> {suggestion.reason}
          </p>
        </CardFooter>
        </>
      )}
    </Card>
  );
}
