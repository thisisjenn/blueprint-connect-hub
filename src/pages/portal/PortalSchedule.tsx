import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

type Status = "Confirmed" | "Pending" | "Completed";

interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string;
  location?: string;
  status: Status;
}

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "1", title: "Site Walkthrough", date: new Date(Date.now() + 86400000 * 2), time: "10:00 AM", location: "123 Oak St", status: "Confirmed" },
  { id: "2", title: "Kitchen Tile Selection", date: new Date(Date.now() + 86400000 * 5), time: "2:30 PM", location: "Showroom — Downtown", status: "Pending" },
  { id: "3", title: "Foundation Milestone Review", date: new Date(Date.now() + 86400000 * 9), time: "9:00 AM", status: "Confirmed" },
  { id: "4", title: "Pre-construction Meeting", date: new Date(Date.now() - 86400000 * 3), time: "11:00 AM", status: "Completed" },
  { id: "5", title: "Final Walkthrough", date: new Date(Date.now() + 86400000 * 21), time: "3:00 PM", location: "123 Oak St", status: "Pending" },
];

const statusVariant: Record<Status, "default" | "secondary" | "outline"> = {
  Confirmed: "default",
  Pending: "secondary",
  Completed: "outline",
};

export default function PortalSchedule() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const sorted = [...MOCK_APPOINTMENTS].sort((a, b) => a.date.getTime() - b.date.getTime());
  const eventDays = MOCK_APPOINTMENTS.map((a) => a.date);
  const dayAppointments = selected
    ? sorted.filter((a) => isSameDay(a.date, selected))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
        <p className="text-muted-foreground">Upcoming appointments and project milestones</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-3">
          {sorted.map((a) => (
            <Card key={a.id} className="hover-lift">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{a.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" />{format(a.date, "MMM d, yyyy")}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{a.time}</span>
                    {a.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{a.location}</span>}
                  </div>
                </div>
                <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid gap-4 md:grid-cols-[auto,1fr]">
            <Card>
              <CardContent className="p-3">
                <Calendar
                  mode="single"
                  selected={selected}
                  onSelect={setSelected}
                  modifiers={{ event: eventDays }}
                  modifiersClassNames={{ event: "bg-accent/30 font-semibold rounded-md" }}
                  className={cn("p-0 pointer-events-auto")}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selected ? format(selected, "EEEE, MMMM d") : "Select a date"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dayAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No appointments on this day.</p>
                ) : (
                  dayAppointments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-sm text-muted-foreground">{a.time}{a.location ? ` • ${a.location}` : ""}</p>
                      </div>
                      <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}