import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ date, onDateChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(date || new Date())
  const [manualDate, setManualDate] = React.useState<string>(date ? format(date, "yyyy-MM-dd") : "")

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    const startYear = 1900 // Go back to 1900 for birth dates
    const endYear = currentYear + 10   // 10 years forward
    
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  }, [])

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handleYearChange = (year: string) => {
    const newMonth = new Date(month)
    newMonth.setFullYear(parseInt(year))
    setMonth(newMonth)
  }

  const handleMonthChange = (monthIndex: string) => {
    const newMonth = new Date(month)
    newMonth.setMonth(parseInt(monthIndex))
    setMonth(newMonth)
  }

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setManualDate(value)
    
    if (value) {
      const parsedDate = new Date(value)
      if (!isNaN(parsedDate.getTime())) {
        onDateChange(parsedDate)
        setMonth(parsedDate)
        setIsOpen(false)
      }
    }
  }

  // Update manual date when date prop changes
  React.useEffect(() => {
    if (date) {
      setManualDate(format(date, "yyyy-MM-dd"))
    } else {
      setManualDate("")
    }
  }, [date])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b space-y-3">
          <div className="flex items-center space-x-2">
            <Select value={months[month.getMonth()]} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthName, index) => (
                  <SelectItem key={monthName} value={index.toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={month.getFullYear().toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {years.reverse().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">Or enter date:</label>
            <input
              type="date"
              value={manualDate}
              onChange={handleManualDateChange}
              min="1900-01-01"
              max={format(new Date(), "yyyy-MM-dd")}
              className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange(selectedDate)
            setIsOpen(false)
          }}
          month={month}
          onMonthChange={setMonth}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          initialFocus
          fixedWeeks
        />
      </PopoverContent>
    </Popover>
  )
}