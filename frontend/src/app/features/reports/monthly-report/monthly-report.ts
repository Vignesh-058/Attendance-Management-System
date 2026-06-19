import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { ReportsService } from '../../../core/services/reports.service';

// Required for PDF export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatSelectModule],
  templateUrl: './monthly-report.html',
  styleUrl: './monthly-report.css'
})
export class MonthlyReport implements OnInit {
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];
  years = [2024, 2025, 2026, 2027];

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  // Updated to match backend records format (mocked if empty)
  reportData: any[] = [];
  displayedColumns: string[] = ['name', 'email', 'status', 'date'];
  isLoading = false;

  private reportsService = inject(ReportsService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.fetchReport();
  }

  fetchReport() {
    this.isLoading = true;
    this.reportsService.getMonthlyReport(this.selectedMonth, this.selectedYear).subscribe({
      next: (data) => {
        this.reportData = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Status,Date\n";

    this.reportData.forEach(row => {
      const name = `${row.user?.firstName || ''} ${row.user?.lastName || ''}`;
      const email = row.user?.email || '';
      csvContent += `${name},${email},${row.status},${row.date}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${this.selectedMonth}_${this.selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text(`Monthly Attendance Report (${this.selectedMonth}/${this.selectedYear})`, 14, 15);

    const tableData = this.reportData.map(row => [
      `${row.user?.firstName || ''} ${row.user?.lastName || ''}`,
      row.user?.email || '',
      row.status,
      row.date
    ]);

    autoTable(doc, {
      head: [['Name', 'Email', 'Status', 'Date']],
      body: tableData,
      startY: 20
    });

    doc.save(`attendance_report_${this.selectedMonth}_${this.selectedYear}.pdf`);
  }
}
