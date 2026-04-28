"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ScanFace, FileText, Calendar, Eye } from "lucide-react"

interface PatientsListProps {
  initialPatients: any[]
}

export function PatientsList({ initialPatients }: PatientsListProps) {
  
  const patients = initialPatients || []

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Patient</TableHead>
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Skin Type</TableHead>
              <TableHead className="text-muted-foreground">Severity</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Added On</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              const birthYear = new Date(patient.date_of_birth).getFullYear()
              const currentYear = new Date().getFullYear()
              const age = currentYear - birthYear

              return (
                <TableRow key={patient.id} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm uppercase">
                          {patient.first_name?.[0]}{patient.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {age} years old
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {patient.patient_number}
                  </TableCell>
                  
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {patient.skin_type || "Not specified"}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="text-xs w-fit text-muted-foreground">
                        Pending Scan
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                    {new Date(patient.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/patients/${patient.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/analysis?patient=${patient.id}`}>
                            <ScanFace className="h-4 w-4 mr-2" />
                            New Scan
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Follow-up
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            
            {patients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No patients found. Click "New Patient" to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}