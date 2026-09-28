"""Realistic "before" sites for the 7 Stand Out Studios samples, each in the style of a common
small-business platform template (Wix, GoDaddy, WordPress, Squarespace...). Only Kerfline is
genuinely outdated. Run: python3 build.py"""
import pathlib

ROOT = pathlib.Path(__file__).parent
SAMPLES = "https://stand-out-studios.pages.dev/samples"
HEAD = ('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">{vp}<meta name="robots" content="noindex,nofollow">'
        '<title>{title}</title><link rel="preconnect" href="https://fonts.googleapis.com">'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{fonts}&display=swap"><style>{css}</style></head><body>')
VP = '<meta name="viewport" content="width=device-width,initial-scale=1">'


def page(title, css, body, fonts="family=Open+Sans:wght@400;600;700", viewport=True):
    return HEAD.format(vp=VP if viewport else "", title=title, fonts=fonts, css=css) + body + "</body></html>"


# 1. Kerfline: genuinely outdated 2014 template (no mobile scaling)
def kerfline():
    css = """body{margin:0;background:#dcdcdc;font:13px Arial,sans-serif;color:#333}#w{width:960px;margin:12px auto;background:#fff;border:1px solid #999;box-shadow:0 0 8px #888}
#t{background:linear-gradient(#2d5a8c,#111);color:#fff;padding:18px 20px;border-bottom:4px solid #e8c000;position:relative}#t h1{font:bold 36px Georgia,serif;margin:0;text-shadow:2px 2px 3px #000}
#t i{color:#ddd}#t .c{position:absolute;right:20px;top:22px;text-align:right;font-size:12px}#t .c b{font-size:15px;color:#ffe45c}
#n{background:linear-gradient(#f4f4f4,#bbb);border-bottom:1px solid #888;padding:0 10px}#n a{display:inline-block;padding:9px 16px;color:#223;font-weight:bold;text-decoration:none;border-right:1px solid #999;font-size:12px}#n a.on{background:#2d5a8c;color:#fff}
#b{height:220px;background:url(img/b-finished-1600.webp) center/cover}#m{overflow:hidden;padding:14px}#l{float:left;width:620px}#r{float:right;width:280px}
h2{color:#2d5a8c;font:22px Georgia,serif;border-bottom:1px dotted #aaa;padding-bottom:4px}.p{float:left;margin:0 12px 8px 0;border:1px solid #999;padding:3px}.p img{width:180px;height:130px;object-fit:cover;display:block}
ul{list-style:none;padding:0;overflow:hidden}li{float:left;width:48%;padding:4px 0;font-weight:bold}li:before{content:"\\2714  ";color:green}
.x{border:1px solid #bbb;background:#f5f5f5;margin-bottom:12px;padding:10px}.x h3{margin:-10px -10px 8px;padding:6px 10px;background:#2d5a8c;color:#fff;font-size:13px}
.btn{display:inline-block;background:linear-gradient(#ffb400,#e07800);color:#fff;font-weight:bold;padding:7px 14px;border-radius:4px;text-decoration:none}
#f{background:#333;color:#aaa;font-size:11px;padding:10px;text-align:center}.k{font-family:monospace;background:#000;color:#0f0;padding:2px 6px}"""
    body = """<div id="w"><div id="t"><h1>Kerfline Cabinetry</h1><i>Quality Custom Cabinets Since 2009 ~ Serving Asheville, NC &amp; Surrounding Areas</i>
<div class="c">Call Us Today!<br><b>(828) 555-0147</b><br>Mon-Fri 8am-5pm</div></div>
<div id="n"><a class="on">HOME</a><a>ABOUT US</a><a>SERVICES</a><a>GALLERY</a><a>TESTIMONIALS</a><a>CONTACT US</a></div><div id="b"></div>
<div id="m"><div id="l"><h2>Welcome to Our Website!</h2><div class="p"><img src="img/s-oak.webp" alt=""></div>
<p>Thank you for visiting the Kerfline Cabinetry website. We are a locally owned and operated company providing quality kitchen and bath cabinets to Asheville, NC and the surrounding areas. Our experienced team is committed to excellence in every job we do, big or small.</p>
<p>Customer satisfaction is our #1 priority. Please browse our website to learn more, and don't hesitate to contact us with any questions!</p>
<h2>Our Services</h2><ul><li>Custom Kitchen Cabinets</li><li>Bathroom Vanities</li><li>Pantries</li><li>Built-Ins</li><li>Cabinet Refacing</li><li>Free Estimates!</li></ul>
<a class="btn">Click Here For A Free Quote &raquo;</a><h2>Latest News</h2><p><b>01/15/2014</b> - We are proud to announce the launch of our new website!</p></div>
<div id="r"><div class="x"><h3>Contact Information</h3>Kerfline Cabinetry<br>Asheville, NC<br>Phone: (828) 555-0147</div>
<div class="x"><h3>Why Choose Us?</h3>&#10004; Licensed &amp; Insured<br>&#10004; Family Owned<br>&#10004; Free Estimates</div>
<p style="text-align:center">Visitors: <span class="k">004127</span></p></div></div>
<div id="f">Copyright &copy; 2014 Kerfline Cabinetry. All Rights Reserved. | Website Design by WebPro Solutions</div></div>"""
    return page("Kerfline Cabinetry - Asheville, NC - Home", css, body, viewport=False)


# 2. Good Dog: Wix-style pet grooming template
def gooddog():
    css = """body{margin:0;font-family:'Quicksand',sans-serif;color:#555;background:#fff}
header{display:flex;justify-content:space-between;align-items:center;padding:18px 6vw;border-bottom:1px solid #f0e6ea}
.logo{font-family:'Pacifico',cursive;font-size:28px;color:#e08aa5}nav a{margin-left:26px;color:#777;text-decoration:none;font-size:15px}
.hero{height:70vh;min-height:420px;background:url(img/hero-neutral.webp) center/cover;display:flex;align-items:center;justify-content:center;text-align:center;position:relative}
.hero:before{content:"";position:absolute;inset:0;background:rgba(255,255,255,.35)}.hero div{position:relative}
.hero h1{font-family:'Pacifico',cursive;font-size:64px;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.35);margin:0;font-weight:400}.hero p{color:#fff;font-size:20px;text-shadow:0 1px 6px rgba(0,0,0,.5)}
.b{display:inline-block;background:#e08aa5;color:#fff;padding:14px 38px;border-radius:30px;text-decoration:none;font-weight:700;margin-top:10px}
section{padding:70px 8vw;text-align:center}h2{font-family:'Pacifico',cursive;font-weight:400;color:#e08aa5;font-size:38px;margin:0 0 20px}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:30px}.g img{width:100%;height:220px;object-fit:cover;border-radius:50%;aspect-ratio:1;height:auto}
.g h3{color:#666}.pink{background:#fdf1f4}footer{background:#e08aa5;color:#fff;text-align:center;padding:26px;font-size:14px}
@media(max-width:700px){.g{grid-template-columns:1fr}.hero h1{font-size:42px}nav{display:none}}"""
    body = """<header><div class="logo">Good Dog Grooming</div><nav><a>Home</a><a>Services</a><a>Gallery</a><a>About</a><a>Contact</a></nav></header>
<div class="hero"><div><h1>Good Dog Grooming</h1><p>Professional Pet Grooming in Boise, ID 🐾</p><a class="b">Book Now</a></div></div>
<section><h2>Welcome!</h2><p>At Good Dog Grooming we treat your pet like family! Our experienced groomers provide a safe, clean and friendly environment for dogs of all breeds and sizes. We look forward to meeting your furry friend!</p></section>
<section class="pink"><h2>Our Services</h2><div class="g"><div><img src="img/svc-bath-m.webp" alt=""><h3>Bath &amp; Brush</h3><p>Starting at $55</p></div>
<div><img src="img/groomer.webp" alt=""><h3>Full Groom</h3><p>Starting at $85</p></div><div><img src="img/after.webp" alt=""><h3>Puppy Package</h3><p>Starting at $45</p></div></div></section>
<section><h2>Contact Us</h2><p>📍 Boise, ID &nbsp;|&nbsp; 📞 (208) 555-0162 &nbsp;|&nbsp; ✉️ gooddoggrooming@gmail.com</p><p>Tues - Sat: 8am - 5pm</p><a class="b">Book Now</a></section>
<footer>© 2023 by Good Dog Grooming. Proudly created with Wix.com</footer>"""
    return page("Home | Good Dog Grooming", css, body, "family=Pacifico&family=Quicksand:wght@400;600;700")


# 3. Clearline: GoDaddy website builder style
def clearline():
    css = """body{margin:0;font-family:'Montserrat',sans-serif;color:#333}
.top{display:flex;justify-content:space-between;align-items:center;padding:16px 5vw;background:#fff}.top b{font-size:20px;letter-spacing:1px;text-transform:uppercase}
.top a{color:#1a7fb5;text-decoration:none;font-weight:600}
.hero{min-height:480px;background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url(img/hero-still.webp) center/cover;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 5vw}
.hero h1{font-size:44px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px}.hero p{font-size:18px;margin:0 0 26px}
.btn{background:#1a7fb5;color:#fff;padding:14px 34px;text-decoration:none;text-transform:uppercase;font-weight:700;font-size:14px;letter-spacing:1px}
.cols{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;padding:64px 8vw;text-align:center}.cols .i{font-size:40px;color:#1a7fb5}
h2{text-align:center;text-transform:uppercase;letter-spacing:2px;font-size:26px}.about{background:#f4f4f4;padding:60px 12vw;text-align:center;line-height:1.7}
.gal{display:grid;grid-template-columns:repeat(3,1fr)}.gal img{width:100%;height:260px;object-fit:cover;display:block}
form{max-width:560px;margin:0 auto 60px;display:grid;gap:12px;padding:0 5vw}input,textarea{padding:12px;border:1px solid #ccc;font:inherit}
button{background:#1a7fb5;color:#fff;border:0;padding:14px;font:700 14px Montserrat;text-transform:uppercase}
footer{background:#222;color:#999;text-align:center;padding:24px;font-size:13px}@media(max-width:700px){.cols,.gal{grid-template-columns:1fr}.hero h1{font-size:30px}}"""
    body = """<div class="top"><b>Clearline Glass &amp; Mirror</b><a>(512) 555-0188</a></div>
<div class="hero"><h1>Austin's Glass Experts</h1><p>Residential &amp; Commercial Glass Repair and Installation</p><a class="btn">Contact Us</a></div>
<div class="cols"><div><div class="i">★</div><h3>Quality</h3><p>We use only the highest quality materials on every job.</p></div>
<div><div class="i">⚑</div><h3>Service</h3><p>Our friendly team is here to help with all your glass needs.</p></div>
<div><div class="i">$</div><h3>Value</h3><p>Competitive prices and free estimates on all projects.</p></div></div>
<div class="about"><h2>About Us</h2><p>Clearline Glass &amp; Mirror is a full-service glass company serving Austin and the surrounding areas. We specialize in window repair, shower doors, mirrors, storefronts and emergency board-up. Call today for a free estimate!</p></div>
<div class="gal"><img src="img/work-shower.webp" alt=""><img src="img/work-mirror.webp" alt=""><img src="img/work-rail.webp" alt=""></div>
<h2 style="margin-top:50px">Contact Us</h2><form><input placeholder="Name"><input placeholder="Email"><input placeholder="Phone"><textarea rows="4" placeholder="Message"></textarea><button type="button">Send</button></form>
<footer>Copyright © 2022 Clearline Glass &amp; Mirror - All Rights Reserved. Powered by GoDaddy</footer>"""
    return page("Clearline Glass & Mirror", css, body, "family=Montserrat:wght@400;600;700")


# 4. Maré: typical restaurant site
def mare():
    css = """body{margin:0;background:#111;color:#ddd;font-family:'Lato',sans-serif}
header{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:20px 5vw;z-index:2}
.logo{font-family:'Great Vibes',cursive;font-size:42px;color:#fff}nav a{color:#fff;margin-left:22px;text-decoration:none;text-transform:uppercase;font-size:13px;letter-spacing:2px}
.slide{height:90vh;background:linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.6)),url(img/harbour.webp) center/cover;display:flex;align-items:center;justify-content:center;text-align:center;position:relative}
.slide h1{font-family:'Great Vibes',cursive;font-size:80px;color:#fff;margin:0;font-weight:400}.slide p{letter-spacing:4px;text-transform:uppercase}
.dots{position:absolute;bottom:24px;left:0;right:0;text-align:center}.dots span{display:inline-block;width:10px;height:10px;border-radius:50%;background:#fff;opacity:.4;margin:0 4px}.dots span:first-child{opacity:1}
section{padding:70px 10vw;text-align:center}h2{font-family:'Great Vibes',cursive;font-size:48px;color:#c9a45c;font-weight:400;margin:0 0 16px}
.btn{display:inline-block;border:1px solid #c9a45c;color:#c9a45c;padding:12px 30px;text-decoration:none;text-transform:uppercase;letter-spacing:2px;font-size:13px;margin:8px}
.three{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}.three img{width:100%;height:280px;object-fit:cover;display:block}
.hours{background:#1b1b1b}.hours table{margin:0 auto;border-collapse:collapse}.hours td{padding:6px 20px;border-bottom:1px solid #333}
footer{background:#000;padding:30px;text-align:center;font-size:13px;color:#888}@media(max-width:700px){.three{grid-template-columns:1fr}.slide h1{font-size:54px}nav{display:none}}"""
    body = """<header><div class="logo">Maré</div><nav><a>Home</a><a>Menu</a><a>About</a><a>Gallery</a><a>Contact</a></nav></header>
<div class="slide"><div><h1>Welcome to Maré</h1><p>Authentic Portuguese Cuisine</p></div><div class="dots"><span></span><span></span><span></span></div></div>
<section><h2>Our Story</h2><p>Family owned and operated since 1994, Maré brings the flavors of Portugal to Fall River. Enjoy fresh seafood, traditional dishes and a great wine list in a warm, friendly atmosphere.</p>
<a class="btn">View Menu (PDF)</a><a class="btn">Order Online</a></section>
<div class="three"><img src="img/fork.webp" alt=""><img src="img/glass-glow.webp" alt=""><img src="img/lemon.webp" alt=""></div>
<section class="hours"><h2>Hours</h2><table><tr><td>Monday</td><td>Closed</td></tr><tr><td>Tuesday - Thursday</td><td>5pm - 10pm</td></tr><tr><td>Friday - Saturday</td><td>5pm - 11pm</td></tr><tr><td>Sunday</td><td>4pm - 9pm</td></tr></table>
<p style="margin-top:24px">123 Main St, Fall River, MA &nbsp;·&nbsp; (508) 555-0174</p></section>
<footer>© 2021 Maré Restaurant. All rights reserved. &nbsp;|&nbsp; Follow us on Facebook &amp; Instagram</footer>"""
    return page("Maré Restaurant | Portuguese Cuisine | Fall River, MA", css, body, "family=Great+Vibes&family=Lato:wght@400;700")


# 5. Cinderpeak: WordPress contractor theme
def cinderpeak():
    css = """body{margin:0;font-family:'Roboto',sans-serif;color:#444}
.bar{background:#c0392b;color:#fff;font-size:13px;padding:8px 5vw;display:flex;justify-content:space-between}
header{display:flex;justify-content:space-between;align-items:center;padding:16px 5vw;box-shadow:0 2px 10px rgba(0,0,0,.08)}
.logo{font-weight:900;font-size:24px;color:#222}.logo span{color:#c0392b}nav a{margin-left:22px;color:#222;text-decoration:none;font-weight:500;text-transform:uppercase;font-size:13px}
.cta{background:#c0392b;color:#fff!important;padding:10px 18px;border-radius:3px}
.hero{min-height:520px;background:linear-gradient(90deg,rgba(0,0,0,.75),rgba(0,0,0,.2)),url(img/hero-d-after.webp) center/cover;color:#fff;display:flex;align-items:center;padding:0 8vw}
.hero h1{font-size:50px;font-weight:900;line-height:1.1;margin:0 0 14px;max-width:620px}.hero p{font-size:18px;max-width:520px}
.btn{display:inline-block;padding:14px 28px;border-radius:3px;font-weight:700;text-decoration:none;margin-right:12px}.red{background:#c0392b;color:#fff}.ghost{border:2px solid #fff;color:#fff}
.stats{display:grid;grid-template-columns:repeat(4,1fr);background:#222;color:#fff;text-align:center;padding:36px 5vw}.stats b{display:block;font-size:40px;color:#c0392b}
section{padding:70px 8vw}h2{text-align:center;font-size:34px;color:#222;margin:0 0 8px}.sub{text-align:center;color:#888;margin-bottom:40px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}.card{box-shadow:0 4px 20px rgba(0,0,0,.08)}.card img{width:100%;height:200px;object-fit:cover;display:block}.card div{padding:20px}
.quote{background:#f5f5f5;text-align:center;font-style:italic;font-size:18px}footer{background:#1a1a1a;color:#888;padding:30px;text-align:center;font-size:13px}
@media(max-width:800px){.cards,.stats{grid-template-columns:1fr 1fr}.hero h1{font-size:34px}nav{display:none}}"""
    body = """<div class="bar"><span>📞 (303) 555-0119 &nbsp; ✉ info@cinderpeakroofing.com</span><span>Mon - Sat: 7:00 - 6:00</span></div>
<header><div class="logo">CINDER<span>PEAK</span></div><nav><a>Home</a><a>About</a><a>Services</a><a>Projects</a><a>Contact</a><a class="cta">Free Estimate</a></nav></header>
<div class="hero"><div><h1>Your Trusted Roofing Experts in Arvada, CO</h1><p>Quality roofing services at affordable prices. Licensed, bonded and insured.</p><a class="btn red">Get A Free Quote</a><a class="btn ghost">Our Services</a></div></div>
<div class="stats"><div><b>25+</b>Years Experience</div><div><b>1,500+</b>Roofs Completed</div><div><b>100%</b>Satisfaction</div><div><b>24/7</b>Emergency Service</div></div>
<section><h2>Our Services</h2><p class="sub">We provide a full range of residential and commercial roofing services</p><div class="cards">
<div class="card"><img src="img/crew-chalk-m.webp" alt=""><div><h3>Roof Replacement</h3><p>Complete roof replacement using top quality materials.</p></div></div>
<div class="card"><img src="img/roof-hail-m.webp" alt=""><div><h3>Storm Damage</h3><p>We work with your insurance company on hail and wind damage.</p></div></div>
<div class="card"><img src="img/hail-lawn.webp" alt=""><div><h3>Roof Repair</h3><p>Fast, reliable repairs for leaks and damaged shingles.</p></div></div></div></section>
<section class="quote">"Great company! They were on time, professional and did a great job on our roof. Highly recommend!" <br><b style="font-style:normal">- John D., Arvada</b></section>
<footer>© 2024 Cinderpeak Roofing. All Rights Reserved. | Powered by WordPress</footer>"""
    return page("Cinderpeak Roofing – Arvada Roofing Contractor", css, body, "family=Roboto:wght@400;500;700;900")


# 6. Saguaro: Squarespace-style minimal template
def saguaro():
    css = """body{margin:0;font-family:'Work Sans',sans-serif;color:#2a2a2a;background:#faf8f5}
header{display:flex;justify-content:space-between;align-items:center;padding:28px 5vw}.logo{font-family:'Cormorant Garamond',serif;font-size:26px;letter-spacing:1px}
nav a{margin-left:28px;color:#2a2a2a;text-decoration:none;font-size:14px}
.hero{height:78vh;background:url(img/dusk-on-1600.webp) center/cover;display:flex;align-items:flex-end;padding:0 5vw 60px}
.hero h1{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:58px;color:#fff;margin:0;text-shadow:0 2px 20px rgba(0,0,0,.4)}
.intro{max-width:640px;margin:90px auto;text-align:center;font-size:17px;line-height:1.8;padding:0 5vw}
h2{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:40px;text-align:center;margin:0 0 30px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:0 5vw 90px}.grid img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.cta{text-align:center;padding:80px 5vw;background:#ece6dd}.btn{display:inline-block;border:1px solid #2a2a2a;padding:14px 36px;color:#2a2a2a;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase}
footer{padding:40px 5vw;font-size:13px;color:#888;display:flex;justify-content:space-between}@media(max-width:700px){.grid{grid-template-columns:1fr 1fr}.hero h1{font-size:38px}nav{display:none}}"""
    body = """<header><div class="logo">Saguaro &amp; Stone</div><nav><a>About</a><a>Services</a><a>Portfolio</a><a>Contact</a></nav></header>
<div class="hero"><h1>Landscapes inspired by the desert.</h1></div>
<p class="intro">Saguaro &amp; Stone is a landscape design and installation company based in Tucson, Arizona. We create beautiful, sustainable outdoor spaces that celebrate the natural beauty of the Sonoran Desert.</p>
<h2>Our Work</h2><div class="grid"><img src="img/plate-agave.webp" alt=""><img src="img/plate-ocotillo.webp" alt=""><img src="img/plate-barrel.webp" alt=""><img src="img/plate-paloverde.webp" alt=""></div>
<div class="cta"><h2>Let's work together.</h2><a class="btn">Get in touch</a></div>
<footer><span>Saguaro &amp; Stone · Tucson, AZ · (520) 555-0133</span><span>© 2023</span></footer>"""
    return page("Saguaro & Stone", css, body, "family=Cormorant+Garamond:wght@400;500&family=Work+Sans:wght@400;500")


# 7. Brightwick: cleaning company template
def brightwick():
    css = """body{margin:0;font-family:'Poppins',sans-serif;color:#444}
header{display:flex;justify-content:space-between;align-items:center;padding:14px 5vw;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.logo{font-weight:700;font-size:22px;color:#14a3a0}.logo small{display:block;font-size:11px;color:#999;font-weight:400;letter-spacing:2px}
.ph{background:#ff7a45;color:#fff;padding:10px 18px;border-radius:24px;font-weight:600;text-decoration:none}
.hero{display:grid;grid-template-columns:1.1fr 1fr;align-items:center;gap:40px;padding:60px 5vw;background:linear-gradient(135deg,#e6f7f6,#fff)}
.hero h1{font-size:46px;color:#14a3a0;margin:0 0 10px;line-height:1.15}.hero ul{list-style:none;padding:0}.hero li{margin:8px 0}.hero li:before{content:"✓ ";color:#14a3a0;font-weight:700}
.quote{background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:28px}.quote h3{margin:0 0 14px;color:#333}
.quote input,.quote select{width:100%;box-sizing:border-box;padding:12px;margin-bottom:10px;border:1px solid #ddd;border-radius:6px;font:inherit}
.quote button{width:100%;background:#ff7a45;color:#fff;border:0;padding:14px;border-radius:6px;font:600 16px Poppins}
.coupon{background:#14a3a0;color:#fff;text-align:center;padding:22px;font-size:20px;font-weight:600}.coupon span{border:2px dashed #fff;padding:6px 14px;margin-left:10px}
section{padding:60px 5vw;text-align:center}.svc{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:30px}.svc img{width:100%;height:190px;object-fit:cover;border-radius:10px}
.badges{display:flex;justify-content:center;gap:30px;color:#999;font-weight:600;flex-wrap:wrap}footer{background:#0f7c7a;color:#d9f2f1;text-align:center;padding:24px;font-size:13px}
@media(max-width:800px){.hero,.svc{grid-template-columns:1fr}.hero h1{font-size:32px}}"""
    body = """<header><div class="logo">Brightwick<small>CLEANING SERVICES</small></div><a class="ph">📞 (608) 555-0151</a></header>
<div class="hero"><div><h1>Sparkling Clean Every Time!</h1><p>Professional house cleaning in Madison, WI</p><ul><li>Bonded &amp; Insured</li><li>Background Checked Cleaners</li><li>100% Satisfaction Guarantee</li><li>Eco-Friendly Products Available</li></ul></div>
<div class="quote"><h3>Get Your Free Quote</h3><input placeholder="Name"><input placeholder="Phone"><input placeholder="Zip Code"><select><option>Select Service</option><option>Standard Cleaning</option><option>Deep Cleaning</option><option>Move In/Out</option></select><button type="button">Get My Quote</button></div></div>
<div class="coupon">New Customers: $25 OFF Your First Clean! <span>CLEAN25</span></div>
<section><h2>Our Services</h2><div class="svc"><div><img src="img/door-still.webp" alt=""><h3>Standard Cleaning</h3></div><div><img src="img/spray.webp" alt=""><h3>Deep Cleaning</h3></div><div><img src="img/squeegee.webp" alt=""><h3>Move In / Move Out</h3></div></div></section>
<section style="background:#f7f7f7"><div class="badges"><span>★★★★★ Google</span><span>Angi Super Service</span><span>BBB A+</span><span>HomeAdvisor Screened</span></div></section>
<footer>© 2024 Brightwick Cleaning Services LLC · Madison, WI · All Rights Reserved</footer>"""
    return page("Brightwick Cleaning Services | House Cleaning Madison WI", css, body, "family=Poppins:wght@400;600;700")


SITES = {"kerfline": ("Kerfline Cabinetry", kerfline), "gooddog": ("Good Dog Grooming", gooddog),
         "clearline": ("Clearline Glass & Mirror", clearline), "mare": ("Maré", mare),
         "cinderpeak": ("Cinderpeak Roofing", cinderpeak), "saguaro": ("Saguaro & Stone", saguaro),
         "brightwick": ("Brightwick Cleaning", brightwick)}


def main():
    rows = []
    for slug, (name, fn) in SITES.items():
        (ROOT / slug / "index.html").write_text(fn())
        rows.append(f'<tr><td>{name}</td><td><a href="{slug}/">Before</a></td><td><a href="{SAMPLES}/{slug}/">After</a></td></tr>')
    (ROOT / "index.html").write_text(
        '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<meta name="robots" content="noindex,nofollow"><title>Before / After</title>'
        '<style>body{font:16px system-ui;margin:24px;background:#fafbfc}td{padding:10px 14px;border-bottom:1px solid #ddd}'
        'a{color:#0B3D9C;font-weight:600}</style><h1>Before / After</h1><table>' + "".join(rows) + "</table>")
    print("built", len(SITES))


if __name__ == "__main__":
    main()
