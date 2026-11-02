import type { Faq } from "@/types/content";

/**
 * General questions shown on every tour. Honest about how booking works; real
 * payment and cancellation terms are confirmed by the team with each booking.
 */
export const generalTourFaqs: Faq[] = [
  {
    question: "How do I book?",
    answer:
      "Send us an enquiry by email or phone. Our team confirms availability and the final price in writing before anything is booked.",
  },
  {
    question: "Are the prices final?",
    answer:
      "Prices marked “illustrative” are samples. Your final price is confirmed by our team when we reply to your request.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "Cancellation terms depend on the tour and are confirmed with your booking. Please ask our team before you book.",
  },
  {
    question: "Can tours be made private or adjusted?",
    answer:
      "Often, yes. Tell us what you have in mind and our team will suggest options.",
  },
];
