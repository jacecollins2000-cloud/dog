"""best_email picks by preference (own domain, then a mailto: link, then a free mailbox), never alphabetically.
Run: python3 -m unittest discover -s outreach"""
import os, pathlib, sys, tempfile, unittest
os.environ.setdefault("SITE_DIR", tempfile.gettempdir())  # pick.py reads it at import
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import pick  # noqa: E402


class BestEmail(unittest.TestCase):
    def test_scans_from_before_the_fix(self):  # alphabetical, font credits included, no mailto column
        self.assertEqual(pick.best_email("impallari@gmail.com info@acmepools.com".split(), "acmepools.com"),
                         "info@acmepools.com")
        self.assertEqual(pick.best_email("anapbm@gmail.com acmeupholstery@gmail.com".split(), "acmeupholstery.com"),
                         "acmeupholstery@gmail.com")
        self.assertEqual(pick.best_email("eben@eyebytes.com team@latofonts.com".split(), "acmeelectric.com"), "")
        self.assertEqual(pick.best_email(["contact@sansoxygen.com"], "acmepools.services"), "")
        self.assertEqual(pick.best_email(["w@yjx.ko"], "acmelandscaping.com"), "")

    def test_preference_order(self):
        emails = ["acme@gmail.com", "handyman@acmehs.com", "office@acmehandyman.com"]
        linked = ["handyman@acmehs.com"]
        self.assertEqual(pick.best_email(emails, "acmehandyman.com", linked), "office@acmehandyman.com")
        self.assertEqual(pick.best_email(emails[:2], "acmehandyman.com", linked), "handyman@acmehs.com")
        self.assertEqual(pick.best_email(emails[:2], "acmehandyman.com"), "acme@gmail.com")

    def test_linked_free_mailbox_beats_unlinked_one(self):
        self.assertEqual(pick.best_email(["abc@gmail.com", "shop@gmail.com"], "acmeupholstery.com", ["shop@gmail.com"]),
                         "shop@gmail.com")


if __name__ == "__main__":
    unittest.main()
