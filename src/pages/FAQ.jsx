const FAQS = [
  { q: 'How are pre-owned phones graded?', a: 'Each device is inspected for screen condition, body wear, and battery health, then assigned a grade from A+ (like new) to C (visible wear).' },
  { q: 'Do pre-owned phones come with a warranty?', a: 'Yes, all pre-owned and refurbished devices include a store warranty — see the product page for the exact duration.' },
  { q: 'How does trade-in work?', a: 'Submit your device details through our Trade-In page, and our team will review it and send you an offer.' },
  { q: 'What payment methods are accepted?', a: 'We currently support cash on delivery, bank transfer, and PromptPay.' },
]

export default function FAQ() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {FAQS.map((f) => (
          <details key={f.q} className="py-4">
            <summary className="font-medium cursor-pointer">{f.q}</summary>
            <p className="text-sm text-neutral-500 mt-2">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
