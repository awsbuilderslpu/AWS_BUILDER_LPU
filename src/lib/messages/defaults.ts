import type { ContactMessage } from "./types";

export const defaultMessages: ContactMessage[] = [
  {
    id: "msg-1",
    name: "Aman Sharma",
    email: "aman.sharma@example.com",
    phone: "+91 9876543210",
    registration_number: "12201234",
    university: "Lovely Professional University",
    subject: "Joining the Club",
    message: "Hi, I am interested in joining the AWS Student Builders Group as a Cloud Associate. I have experience with AWS S3, Lambda, and Node.js. Looking forward to hearing from you!",
    resume_path: null,
    status: "new",
    assigned_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    updated_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "msg-2",
    name: "Priya Patel",
    email: "priya.p@example.com",
    phone: "+91 9812345678",
    registration_number: "12108765",
    university: "Lovely Professional University",
    subject: "Events & Workshops",
    message: "Will there be another Cloud Practitioner certification bootcamp organized this semester? Would love to attend!",
    resume_path: null,
    status: "read",
    assigned_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "msg-3",
    name: "Rohan Verma",
    email: "rohan.v@example.com",
    phone: "+91 9765432109",
    registration_number: "12019988",
    university: "Lovely Professional University",
    subject: "Partnership / Collaboration",
    message: "We are running a tech hackathon next month and would like to invite AWS Builder Group LPU as a community partner. Could we schedule a quick call?",
    resume_path: null,
    status: "in_progress",
    assigned_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

