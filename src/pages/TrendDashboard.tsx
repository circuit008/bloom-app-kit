import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  name: string;
  event_date: string;
  country: string;
  category: string;
  description: string;
  suggested_themes: string[];
}

const TrendDashboard = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [suggestions, setSuggestions] = useState<{ [key: string]: string[] }>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      const future = futureDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('events_calendar')
        .select('*')
        .gte('event_date', today)
        .lte('event_date', future)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async (eventId: string) => {
    setLoadingSuggestions(prev => ({ ...prev, [eventId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: { eventId }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSuggestions(prev => ({ ...prev, [eventId]: data.suggestions }));
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Holiday': 'bg-red-500',
      'Seasonal': 'bg-green-500',
      'Sports': 'bg-blue-500',
      'Cultural': 'bg-purple-500',
      'Shopping': 'bg-orange-500',
      'Environmental': 'bg-emerald-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trend Dashboard</h1>
        <p className="text-muted-foreground mt-1">Discover upcoming events and trending design ideas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Next 90 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Event</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents[0] ? (
              <>
                <div className="text-2xl font-bold">{upcomingEvents[0].name}</div>
                <p className="text-xs text-muted-foreground">
                  {getDaysUntil(upcomingEvents[0].event_date)} days away
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Design Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(suggestions).reduce((acc, curr) => acc + curr.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">AI-generated suggestions</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {upcomingEvents.map((event) => {
          const daysUntil = getDaysUntil(event.event_date);
          const eventSuggestions = suggestions[event.id] || [];
          const isLoading = loadingSuggestions[event.id];

          return (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{event.name}</CardTitle>
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {daysUntil} days
                      </Badge>
                    </div>
                    <CardDescription>{event.description}</CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.suggested_themes.map((theme, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => loadSuggestions(event.id)}
                    disabled={isLoading || eventSuggestions.length > 0}
                    size="sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : eventSuggestions.length > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {eventSuggestions.length} Ideas
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Ideas
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              {eventSuggestions.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm mb-3">Design Suggestions:</h4>
                    {eventSuggestions.map((suggestion, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-2 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm">{suggestion}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/design-studio', { state: { prompt: suggestion } })}
                        >
                          Generate
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TrendDashboard;
