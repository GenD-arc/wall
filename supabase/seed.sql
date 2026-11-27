-- Optional: a few friendly sample posts so the wall isn't empty.
insert into public.posts (author_name, body, created_at) values
  ('Sheryl', 'When are we gonna deploy your latest dance moves to production? #AgileDancer', now() - interval '8 hours'),
  ('Alex',   'Pulled an all-nighter on the assignment. Turns out sleep deprivation does not improve coding skills.', now() - interval '6 hours'),
  ('Juho',   'Genesis, still coding in pajamas, or upgraded to full-time sweatpants mode?', now() - interval '4 hours'),
  ('Anna',   'Hey Genesis, did you debug your coffee maker yet? Last cup tasted like JavaScript errors.', now() - interval '2 hours');
