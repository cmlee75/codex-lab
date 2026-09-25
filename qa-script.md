# QA script — run at 1440px and at 375px

1. **Home.** Hero headline, both buttons and the photo collage are
   visible without horizontal scroll.
2. **Filters.** Click Bakery: exactly 10 cards, all BAK-. Click Cooking:
   10 cards, all CUL-. Click All: 20.
3. **Search.** Type "vegan": only CUL-208. Clear it.
4. **Sign-up (bad).** BAK-104 → Sign up. Name "Test", email
   "not-an-email", mobile "12345", no consent → Submit. Expect an inline
   error and red fields.
5. **Sign-up (good).** Valid email, "+65 9123 4567", allergy "nut
   allergy", tick consent → expect the nut warning, then a CB- reference.
6. **Assistant.** Ask:
   - "Is the macaron class safe for a nut allergy?" → not suitable
   - "What is the cheapest course?" → CUL-210, S$160
   - "What's the weather tomorrow?" → the refusal
7. **Keyboard.** Tab to Sign up on any card; open and submit the dialog
   without a mouse.
