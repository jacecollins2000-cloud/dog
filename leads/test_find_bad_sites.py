"""Font-license credits and regex junk must never come out as a lead's email.
Run: python3 -m unittest discover -s leads"""
import pathlib, re, sys, unittest
from unittest import mock
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import find_bad_sites as fbs  # noqa: E402

# Google Fonts license lines inlined by GoDaddy Website Builder sites, verbatim from the scanned pages
LICENSES = [
    "Copyright 2016 The Cabin Project Authors (impallari@gmail.com)",
    "Copyright (c) 2011 by Ana Paula Megda (www.anamegda.com|anapbm@gmail.com), with Reserved Font Name Lusitana.",
    'Copyright (c) 2011 by Sorkin Type Co (www.sorkintype.com eben@eyebytes.com), with Reserved Font Name "Fjalla"',
    "Copyright 2016 The Muli Project Authors (contact@sansoxygen.com)",
    'Copyright (c) 2010-2011 by tyPoland Lukasz Dziedzic (team@latofonts.com) with Reserved Font Name "Lato". '
    "Licensed under the SIL Open Font License, Version 1.1.",
    'YesevaOne-Regular.ttf: Copyright 2012 The Yeseva One Project Authors (lemonad@jovanny.ru), '
    'with Reserved Font Name "Yeseva".',
]


def godaddy_page(body):
    """Page shaped like GoDaddy's builder output: each font's license comment and @font-face in a <style>."""
    styles = "".join(f"<style>/*\n{lic}\n\nThis Font Software is licensed under the SIL Open Font License, Version 1.1.\n*/\n"
                     "@font-face {\n  font-family: 'Cabin';\n  src: url(//img1.wsimg.com/gfonts/s/cabin/v27/a.woff2);\n}\n"
                     "</style>" for lic in LICENSES)
    return (f'<html><head><meta name="generator" content="Starfield Technologies; Go Daddy Website Builder 8.0.0000">'
            f"{styles}</head><body>{body}</body></html>")


class EmailsIn(unittest.TestCase):
    @mock.patch.object(fbs, "FONT_LICENSE", re.compile("(?!)"))  # with the other two defenses off,
    @mock.patch.object(fbs, "FONT_CREDIT_EMAILS", set())         # skipping <style> alone must do it
    def test_font_credits_in_style_blocks(self):
        page = godaddy_page('<p>Contact us at <a href="mailto:Info@AcmePools.com">Info@AcmePools.com</a></p>')
        self.assertEqual(fbs.emails_in(page), ["info@acmepools.com"])
        self.assertEqual(fbs.emails_in(page, mailto_only=True), ["info@acmepools.com"])

    @mock.patch.object(fbs, "FONT_CREDIT_EMAILS", set())  # prove the license text itself is skipped
    def test_font_licenses_outside_style_blocks(self):
        for lic in LICENSES:
            with self.subTest(lic=lic):
                self.assertEqual(fbs.emails_in(f'<script>var css = "/*\\n{lic}\\n*/";</script><p>{lic}</p>'), [])

    def test_font_face_rules(self):  # CSS a script injects, so there's no <style> around it
        css = "@font-face {\n  font-family: 'Fjalla One';\n  /* drawn by eben@sorkintype.com */\n  src: url(a.woff2);\n}"
        self.assertEqual(fbs.emails_in(f"<script>injectCss(`{css}`)</script>"), [])

    def test_denylist_backstop(self):
        for e in sorted(fbs.FONT_CREDIT_EMAILS):
            with self.subTest(email=e):
                self.assertEqual(fbs.emails_in(f'<p>{e}</p><a href="mailto:{e}">x</a>'), [])

    def test_invalid_tld(self):
        self.assertEqual(fbs.emails_in("<p>\x16\x0b3{w@yjX.ko\x164./Sw</p>"), [])  # from an undecoded gzip body
        self.assertEqual(fbs.emails_in("<p>office@acme.solutions hi@acmepools.services Acme.Pools@Gmail.Com</p>"),
                         ["acme.pools@gmail.com", "hi@acmepools.services", "office@acme.solutions"])

    def test_business_copyright_footer_kept(self):
        page = "<footer>Copyright © 2021 Acme Pools - All Rights Reserved. Email info@acmepools.com</footer>"
        self.assertEqual(fbs.emails_in(page), ["info@acmepools.com"])


class OwnEmails(unittest.TestCase):
    def test_preference_order(self):
        emails = ["acmepools@gmail.com", "billing@acmepools.com", "info@acmepools.com", "joe@acmepoolco.com",
                  "sales@webagency.com"]
        self.assertEqual(fbs.own_emails(emails, "https://www.acmepools.com/", {"joe@acmepoolco.com"}),
                         ["info@acmepools.com", "billing@acmepools.com", "joe@acmepoolco.com", "acmepools@gmail.com"])

    def test_off_domain_needs_mailto(self):
        self.assertEqual(fbs.own_emails(["mike@acmesteam.com"], "https://acmesteamers.com/"), [])
        self.assertEqual(fbs.own_emails(["mike@acmesteam.com"], "acmesteamers.com", {"mike@acmesteam.com"}),
                         ["mike@acmesteam.com"])

    def test_lookalike_domain_is_not_own(self):
        self.assertEqual(fbs.own_emails(["info@notacmepools.com"], "acmepools.com"), [])
        self.assertEqual(fbs.own_emails(["info@mail.acmepools.com"], "acmepools.com"), ["info@mail.acmepools.com"])


class Check(unittest.TestCase):
    def test_contact_page_mailto_on_related_domain(self):
        pages = {"https://acmesteamers.com": godaddy_page('<a href="/contact-us">Contact Us</a>'),
                 "https://acmesteamers.com/contact-us": godaddy_page('<a href="mailto:Mike@acmesteam.com">Email Mike</a>')}
        with mock.patch.object(fbs, "get", lambda url, timeout=15: (url, pages[url])):
            r = fbs.check({"trade": "carpet cleaning", "city": "Mesa", "name": "Acme Steamers", "phone": "",
                           "years_in_business": "", "website": "http://acmesteamers.com"})
        self.assertEqual((r["emails"], r["mailto"]), ("mike@acmesteam.com", "mike@acmesteam.com"))


if __name__ == "__main__":
    unittest.main()
