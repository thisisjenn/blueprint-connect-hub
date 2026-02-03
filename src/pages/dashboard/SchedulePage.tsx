import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { useState } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const events = [
  {
    id: 1,
    title: "Site Visit - Smith Residence",
    time: "9:00 AM - 11:00 AM",
    location: "123 Oak Street",
    type: "visit",
    attendees: ["JD", "JS"],
  },
  {
    id: 2,
    title: "Client Meeting - ABC Corp",
    time: "2:00 PM - 3:00 PM",
    location: "Virtual",
    type: "meeting",
    attendees: ["JD", "SA"],
  },
  {
    id: 3,
    title: "Permit Submission Deadline",
    time: "5:00 PM",
    location: "City Hall",
    type: "deadline",
    attendees: [],
  },
];

const upcomingEvents = [
  { id: 1, title: "Foundation Inspection", date: "Feb 5", time: "10:00 AM", type: "inspection" },
  { id: 2, title: "Team Standup", date: "Feb 5", time: "9:00 AM", type: "meeting" },
  { id: 3, title: "Client Presentation", date: "Feb 6", time: "2:00 PM", type: "presentation" },
  { id: 4, title: "Material Delivery", date: "Feb 7", time: "8:00 AM", type: "delivery" },
];

export default function SchedulePage() {
  const [currentDate] = useState(new Date());
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getEventTypeStyles = (type: string) => {
    switch (type) {
      case "visit":
        return "border-l-info bg-info/5";
      case "meeting":
        return "border-l-accent bg-accent/5";
      case "deadline":
        return "border-l-destructive bg-destructive/5";
      case "inspection":
        return "border-l-warning bg-warning/5";
      case "presentation":
        return "border-l-success bg-success/5";
      default:
        return "border-l-muted-foreground bg-muted";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Schedule"
        subtitle="Manage appointments, deadlines, and team schedules"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {currentMonth} {currentYear}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="accent" size="sm" className="gap-2 ml-2">
                  <Plus className="w-4 h-4" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer ${
                      day === currentDay
                        ? "bg-accent text-accent-foreground font-bold"
                        : day
                        ? "hover:bg-muted"
                        : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Today's Events */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-4">
                  Today's Schedule
                </h4>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border-l-4 ${getEventTypeStyles(event.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-foreground">
                            {event.title}
                          </h5>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                        {event.attendees.length > 0 && (
                          <div className="flex -space-x-2">
                            {event.attendees.map((attendee, idx) => (
                              <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {attendee}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="w-12 text-center">
                    <p className="text-xs text-muted-foreground">{event.date.split(" ")[0]}</p>
                    <p className="text-lg font-bold text-foreground">{event.date.split(" ")[1]}</p>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-foreground text-sm">
                      {event.title}
                    </h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      event.type === "meeting"
                        ? "info"
                        : event.type === "inspection"
                        ? "warning"
                        : event.type === "presentation"
                        ? "success"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {event.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
