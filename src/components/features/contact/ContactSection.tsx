import * as React from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { contactHeading, contactIntro } from "@/data/contact";
import { ContactDecor } from "@/components/features/contact/ContactDecor";
import { ContactForm } from "@/components/features/contact/ContactForm";
import { ContactInfo } from "@/components/features/contact/ContactInfo";
import { MapCard } from "@/components/features/contact/MapCard";

export function ContactSection() {
  return (
    <section className="relative overflow-hidden pb-12">
      <ContactDecor />

      {/* Header */}
      <div className="relative z-10 w-full px-6 pt-7 xl:pl-[11.2%] xl:pr-6">
        <SectionEyebrow lines="both">Contact Us</SectionEyebrow>
        <PageHeading
          as="h1"
          size="md"
          lines={contactHeading}
          className="mt-3"
        />
        <p className="mt-2 text-base leading-6 text-muted-foreground max-w-[clamp(300px,26.6vw,445px)]">
          {contactIntro}
        </p>
      </div>

      {/* Main grid */}
      <div className="relative z-10 mt-8 grid w-full grid-cols-1 gap-6 px-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:pl-[11.2%] xl:pr-[7.7%]">
        <ContactForm />
        <div className="flex flex-col gap-5">
          <ContactInfo />
          <MapCard className="flex-1" />
        </div>
      </div>
    </section>
  );
}
