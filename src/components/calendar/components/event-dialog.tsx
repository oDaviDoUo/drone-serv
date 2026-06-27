"use client";

import { useEffect, useMemo, useState } from "react";
import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react";
import { format, isBefore } from "date-fns";

import type { CalendarEvent, EventColor } from "./";
import {
  DefaultEndHour,
  DefaultStartHour,
  EndHour,
  StartHour
} from "../constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea";

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}



export function EventDialog({ event, isOpen, onClose, onSave, onDelete }: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`);
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`);
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [color, setColor] = useState<EventColor>("sky");
  const [error, setError] = useState<string | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
 

  // Debug log to check what event is being passed
  useEffect(() => {
    console.log("EventDialog received event:", event);
  }, [event]);

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");

      const start = new Date(event.start);
      const end = new Date(event.end);

      setStartDate(start);
      setEndDate(end);
      setStartTime(formatTimeForInput(start));
      setEndTime(formatTimeForInput(end));
      setAllDay(event.allDay || false);
      setLocation(event.location || "");
      setColor((event.color as EventColor) || "sky");
      setError(null); // Reset error when opening dialog
    } else {
      resetForm();
    }
  }, [event]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime(`${DefaultStartHour}:00`);
    setEndTime(`${DefaultEndHour}:00`);
    setAllDay(false);
    setLocation("");
    setColor("sky");
    setError(null);
  };

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = Math.floor(date.getMinutes() / 15) * 15;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Memoize time options so they're only calculated once
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        const value = `${formattedHour}:${formattedMinute}`;
        // Use a fixed date to avoid unnecessary date object creations
        const date = new Date(2000, 0, 1, hour, minute);
        const label = format(date, "h:mm a");
        options.push({ value, label });
      }
    }
    return options;
  }, []); // Empty dependency array ensures this only runs once

  const handleSave = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!allDay) {
      const [startHours = 0, startMinutes = 0] = startTime.split(":").map(Number);
      const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number);

      if (
        startHours < StartHour ||
        startHours > EndHour ||
        endHours < StartHour ||
        endHours > EndHour
      ) {
        setError(`Selected time must be between ${StartHour}:00 and ${EndHour}:00`);
        return;
      }

      start.setHours(startHours, startMinutes, 0);
      end.setHours(endHours, endMinutes, 0);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    // Validate that end date is not before start date
    if (isBefore(end, start)) {
      setError("End date cannot be before start date");
      return;
    }

    // Use generic title if empty
    const eventTitle = title.trim() ? title : "(no title)";

    onSave({
      id: event?.id || "",
      title: eventTitle,
      description,
      start,
      end,
      allDay,
      location,
      color
    });
  };

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
    }
  };

  const colorOptions: Array<{
  value: EventColor;
  label: string;
  bgColor: string;
  borderColor: string;
  bgColorChecked: string;
  borderColorChecked: string;
}> = [
  {
    value: "ruby",
    label: "Ruby Red",
    bgColor: "#fb7185", // rose-400
    borderColor: "#fb7185",
    bgColorChecked: "#e11d48", // rose-600
    borderColorChecked: "#e11d48"
  },
  {
    value: "amber",
    label: "Amber",
    bgColor: "#fbbf24", // amber-400
    borderColor: "#fbbf24",
    bgColorChecked: "#d97706", // amber-600
    borderColorChecked: "#d97706"
  },
  {
    value: "mustard",
    label: "Mustard",
    bgColor: "#facc15", // yellow-400
    borderColor: "#facc15",
    bgColorChecked: "#ca8a04", // yellow-600
    borderColorChecked: "#ca8a04"
  },
  {
    value: "emerald",
    label: "Emerald",
    bgColor: "#34d399", // emerald-400
    borderColor: "#34d399",
    bgColorChecked: "#059669", // emerald-600
    borderColorChecked: "#059669"
  },
  {
    value: "sky",
    label: "Sky Blue",
    bgColor: "#38bdf8", // sky-400
    borderColor: "#38bdf8",
    bgColorChecked: "#0284c7", // sky-600
    borderColorChecked: "#0284c7"
  },
  {
    value: "violet",
    label: "Violet",
    bgColor: "#a78bfa", // violet-400
    borderColor: "#a78bfa",
    bgColorChecked: "#7c3aed", // violet-600
    borderColorChecked: "#7c3aed"
  },
  {
    value: "fuchsia",
    label: "Fuchsia",
    bgColor: "#e879f9", // fuchsia-400
    borderColor: "#e879f9",
    bgColorChecked: "#c026d3", // fuchsia-600
    borderColorChecked: "#c026d3"
  },
  {
    value: "slate",
    label: "Slate Gray",
    bgColor: "#94a3b8", // slate-400
    borderColor: "#94a3b8",
    bgColorChecked: "#475569", // slate-600
    borderColorChecked: "#475569"
  }
];


const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] z-[1300] bg-neutral-900/60 border border-neutral-700 text-neutral-200 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>{event?.id ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription className="sr-only break-words">
            {event?.id ? "Edit the details of this event" : "Add a new event to your calendar"}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-4 py-4" >
          <div className="*:not-first:mt-1.5">
            <Label htmlFor="title">Mission</Label>
            {/* <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} /> */}
            <Select>
            <SelectTrigger className="w-full bg-transparent border-neutral-700">
              <SelectValue placeholder="Select a mission" />
            </SelectTrigger>
            {/* z-[1400], потому что у диалога 1300 */}
            <SelectContent className="z-[1400] bg-neutral-900 border-neutral-700 text-neutral-200">
              {frameworks.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          <div className="*:not-first:mt-1.5 min-w-0">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="*:not-first:mt-1.5">
            <Label htmlFor="title">Drone</Label>
            <Select>
            <SelectTrigger className="w-full bg-transparent border-neutral-700">
              <SelectValue placeholder="Select a drone" />
            </SelectTrigger>
            <SelectContent className="z-[1400] bg-neutral-900 border-neutral-700 text-neutral-200">
              {frameworks.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 *:not-first:mt-1.5">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "group bg-transparent border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px] dark",
                      !startDate && "text-muted-foreground"
                    )}>
                    <span className={cn("truncate", !startDate && "text-muted-foreground")}>
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </span>
                    <RiCalendarLine
                      size={16}
                      className="text-muted-foreground/80 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 z-[1300] dark" align="start">
                  <Calendar
                   
                    mode="single"
                    selected={startDate}
                    defaultMonth={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        // If end date is before the new start date, update it to match the start date
                        if (isBefore(endDate, date)) {
                          setEndDate(date);
                        }
                        setError(null);
                        setStartDateOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!allDay && (
              <div className="min-w-28 *:not-first:mt-1.5 dark">
                <Label htmlFor="start-time">Start Time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="start-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="z-[1300] dark">
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 *:not-first:mt-1.5">
              <Label htmlFor="end-date">End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "group bg-transparent  border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px] dark ",
                      !endDate && "text-muted-foreground"
                    )}>
                    <span className={cn("truncate", !endDate && "text-muted-foreground")}>
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </span>
                    <RiCalendarLine
                      size={16}
                      className="text-muted-foreground/80 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 z-[1300] dark" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    defaultMonth={endDate}
                    disabled={{ before: startDate }}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setError(null);
                        setEndDateOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* {!allDay && (
              <div className="min-w-28 *:not-first:mt-1.5 dark">
                <Label htmlFor="end-time">End Time</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="end-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="z-[1300] dark">
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )} */}
          </div>

          {/* <div className="flex items-center gap-2">
            <Checkbox
              id="all-day"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked === true)}
            />
            <Label htmlFor="all-day">All day</Label>
          </div> */}

          {/* <div className="*:not-first:mt-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div> */}
          <fieldset className="space-y-4">
            <legend className="text-white text-sm leading-none font-medium">Color</legend>
            <RadioGroup
              className="flex gap-1.5"
              value={color}
              onValueChange={(value: EventColor) => setColor(value)}
            >
              {colorOptions.map((colorOption) => {
                const isChecked = color === colorOption.value;
                return (
                  <RadioGroupItem
                    key={colorOption.value}
                    id={`color-${colorOption.value}`}
                    value={colorOption.value}
                    aria-label={colorOption.label}
                    className="size-6 shadow-none border-2 rounded-full cursor-pointer [&>span]:hidden"
                    style={{
                      backgroundColor: isChecked ? colorOption.bgColorChecked : "transparent",
                      borderColor: isChecked ? colorOption.borderColorChecked : colorOption.borderColor
                    }}
                  />
                );
              })}
            </RadioGroup>
          </fieldset>
        </div>
        <DialogFooter className="flex-row sm:justify-between">
          {event?.id && (
            <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Delete event" className="hover:bg-red-600">
              <RiDeleteBinLine size={16} aria-hidden="true" />
            </Button>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}