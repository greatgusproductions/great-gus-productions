---
title: "We Rebuilt Our Website"
date: "2026-03-26"
author: "GGP"
readTime: "17 min read"
image: "/images/blog/we-rebuilt-our-website.webp"
excerpt: "We rebuilt the Great Gus Productions website from scratch to leave Wix behind, cut costs, and take full control of our films, shop, blog, and scripts."
---

Hello, fellow humans! We have a couple updates for you before, you know, World War III officially begins. First off, we released The Powwow here on our website. We made posts about it on our social medias, but we figured we should mention it here in the blog. You should check it out. It was great. And secondly, we rebuilt our website entirely from scratch.

![Illustration for We Rebuilt Our Website](/images/blog/we-rebuilt-our-website.webp)

As you can see, this new site pretty much looks exactly like our old one, but with the main difference being that it is no longer associated with Wix. Like many small adventures, this one began with a bill. For the first three years of our small filmmaking journey, our website cost was approximately $30 per year. And for the last three years, our website cost increased to approximately $100 per year. In the grand scheme of modern expenses, that felt pretty reasonable. It gave us a place where our films could live and where people could learn who we are as a company, maybe buy some swag, read a couple blogs. Simple things.

Then the price jumped to $400 per year. We were like, "Nope, not doing that." That 4x increase felt a little harder to justify on our end. It started to feel less like maintaining a home on the internet and more like paying rent just to stand on our own property. So we had a choice. We could keep paying the ever-increasing platform expense because it was familiar and convenient, or we could try building the site ourselves and see what happened. We chose to build.

## The Goal

The goal sounded straightforward when you say it quietly and without thinking:

> Build a website that looks and feels similar to what we already had, but without the ongoing platform cost attached to it.

No grand tech startup ambitions. No plans to reinvent the internet. We simply wanted a place where our films, blog, scripts, shop, and general corner of the internet could exist without worrying about the next subscription increase. Because I don't know if you know this, but we don't really make very much money from our films. The challenge was that none of us come from deep computer science backgrounds.

## Tools Needed

Before we get too far into the story, it might help to explain the core tools that made the project possible.

### VS Code (Visual Studio Code)

This is the editor where we actually built the site. Think of it like a digital workshop. It's where the code lives while you're working on it, where you edit pages, adjust styles, and test ideas.

### GitHub Desktop

This helped us keep track of our changes. When we updated something, we could "commit" the changes (basically saving a snapshot of the project) and push them to GitHub. That gave us version history and a backup of the entire site.

### Netlify

Netlify hosts the site. In plain language, it's the service that takes our files and publishes them on the internet so anyone can visit the website.

### Namecheap

We transferred our domain registration from Wix to Namecheap. Domain registration is essentially ownership of the web address itself, the name people type into their browser.

### Cloudflare

Cloudflare manages our DNS records and adds security. DNS is basically the internet's address book. When someone types your domain name, DNS tells the internet which server the site lives on. Cloudflare also helps filter malicious traffic and adds an extra layer of protection.

Those pieces together formed the foundation of our journey.

## Our Main Tool

Enter Artificial Intelligence. I've seen many posts about how AI should not be in a creative's repertoire, which I can totally understand. I was hesitant to use it. Don't get me wrong, I'd prefer AI didn't make our movies. But I don't know if I agree that AI should be completely out of the picture, unless of course AIs are actual demonic entities giving us answers and art from the underworld. If that's the case, then we should for sure throw it in the Lake of Fire. I mean most of us use so many different technological tools as is. Having something like AI organize for us felt like it would be beneficial. We ended up using three different AI tools at different stages of the process.

- Claude helped in the early phase.
- ChatGPT helped during the middle.
- Copilot helped for the end.

That sequence wasn't planned. These aren't paid advertisements for these services. It's simply how the project unfolded. Originally we were just going to go with Claude, but we quickly ran out of usage on the free plan. So I took the Claude info into ChatGPT and that lasted for a while. It got us pretty far. We had everything set up except the Shop, Blog, and Scripts pages. But we again ran out of usage. So I tried going back to Claude, but Claude wasn't there during a lot of the build stage, so it was giving crazy responses that looked nothing like what we worked on in the beginning. So we went back to ChatGPT and paid the $20 to help finish it off.

Claude helped during the early planning stage, when we were deciding what kind of structure the site should have. It helped us install VS Code on the MacBook, how VS Code worked, and where to find the localhost of what we were building. It taught us how to transfer our domain away from Wix and onto another DNS platform like Cloudflare. It walked us through using GitHub Desktop to commit newly changed files and push to origin so they can be deployed on Netlify. And it did all that as if it were teaching a five-year-old child how to do it. All very simple instructions. I asked if this is what it feels like teaching a child the alphabet and it responded with, "No, this is what it feels like teaching a child a letter. Just one single letter of the alphabet."

The entire process was pretty fun. It all felt very creative. I think everybody should build a website from scratch at least once in their life, even if you need the help of AI.

## The Middle

The middle phase is where the project became more real and more complicated. This is where ChatGPT helped a great deal. This is the stage where every solved problem revealed three new ones. Real slow going.

At first glance, a website seems simple. You need pages. A few images. Maybe a contact page. But then you start noticing the invisible systems that make everything work. Forms. Policies. Shopping carts. Taxes. Shipping logic. Confirmation emails. Security checks. APIs. A working website is a bit like a movie set. From the audience's perspective, it looks effortless. Behind the scenes there was a lot of careful planning holding everything together. But piece by piece, the new site started to look and feel like our old site. And that's the only way it could happen. There was no one-shotting a prompt to get a website. I mean there is, but that version of a website looks and acts horribly. No, what ends up happening is you go page by page until all the pages you want are filled out. For a simple page, it might take an hour of back and forth with the AI of your choice. For more complex pages, it might take 3 or 4 hours. When we got to the Shop page, ChatGPT laid out a four-day, step-by-step process. It took us about 8 days to actually implement all of those steps, but probably only like ten actual hours of work. And that's because we didn't know what it was talking about half the time.

And then things just started to work. Everything felt solid. The film pages found their place. The trailers were successfully embedded from YouTube. The blog had a home. The scripts section worked correctly. The shop began taking shape. And gradually the site began to feel more like ours than it had when we were on Wix. If something needed to change, we didn't have to navigate layers of platform settings or subscription tiers. We could simply adjust the site ourselves and have it deployed live in less than a minute. It was cool.

There definitely were moments where something looked perfect on desktop but strange on mobile. Sometimes a small change in one section caused something completely unrelated to behave differently somewhere else. But the little details started ironing themselves out. Don't ask us how. They just started behaving. Sometimes stopping and restarting the terminal helped. I still don't understand what caches and cookies are.

## The Shop Page

If there is a villain of the story, it's definitely the Shop page. Building a website is one thing. Building a website that sells swag is another. Once money gets involved, the stakes unfortunately increase. More questions emerged.

- Can someone successfully buy a hat?
- Does the right size shirt go to the right address?
- Does the order move through the system correctly?
- Are we making sure we ourselves are not handling any of the payment information data?

In our case, the process involved several services working together. One system (Stripe), handled payment. Another (Printful) handled production of the merchandise. Another (our webhook) received the order with the sole job of making sure it got sent to the right place. In theory, the process is straightforward. In practice, it required careful coordination between all three, and then we had to add another service (Resend) to the code to let us know why things kept failing.

## The Dumb Drafts Phase

This is where Copilot came in. And in all honesty, I wish I would have found Copilot right away. My German brother-in-law (also a machine) introduced me to it. He was like you should get this. And I was like, "Implementing that sounds daunting." It wasn't. It took like ten minutes to set everything up and the best part was that it uses all GPT versions. So the GPT 5.3 version I was using from ChatGPT was able to be used on Copilot. Of course, Copilot GPT 5.3 doesn't have any knowledge of ChatGPT GPT 5.3's conversation with me. I was like, Copilot GPT 5.3, you helped me build this. And Copilot was like, "This is the first time I've ever seen this code."

By this point the site mostly worked, which is probably the dumbest stage. A mostly working system can hide small issues that only appear under certain conditions. One of the final challenges involved Printful, the service that handled the merchandise fulfillment. Ideally, the system should behave like a clean relay: a customer places an order, the payment goes through Stripe, the webhook takes the jumbled-up price ID variant from Stripe and pushes it to Printful, the order moves to production automatically, and the item begins its journey to the customer.

Instead, orders initially appeared as "drafts," which meant the order existed in the Printful system but hadn't fully completed its process yet. Which means I would have to go in and manually click confirm on each draft so Printful can start making the item and then ship the item. We spent a lot of time testing, adjusting, deploying updates, and testing again. Building everything else on the site probably took 20 hours of work. This part of trying to figure out why drafts weren't auto-confirming also took 20 hours. We added all sorts of logs to the code, so when it failed, we could see exactly what was happening in the logs on Netlify. We also ended up adding Resend to the code, so when something went wrong in the order purchase process, it emailed right away. For reference, deploying a site simply means sending the latest version of your changes out into the world. You make a fix in VS Code, commit and push origin on GitHub Desktop, run a test purchase again, and check the logs and terminal if the problem persisted.

After enough testing and refinement, the process stabilized. The problem then became a usage issue for Netlify. Our Netlify plan allows for a certain amount of deploys and can probably handle 20-30 thousand users in a month. The deploys take the most usage and we went through them pretty quickly in the dumb drafts phase. Netlify responded with, "Hey, pay $9.99 to allow more usage so your site is back up," but we didn't want to keep spending money. So we waited a week until it renewed the free plan usage and began again. This time with everything working.

## Audits

This was probably the second longest phase. I had Copilot run full-depth audits on every single aspect of the site. It would come up with things that I had no understanding of. I thought it was speaking a different language. So I would paste its response into ChatGPT and ChatGPT was like, "He makes valid points. You should change those." And I was like, "He? Why is Copilot a he?" And Chat was like, "I'm sorry, you used he earlier for Copilot so I assumed you named him a he." "I didn't know you could name AIs." "You could name anything if you really wanted to." And I had no response because it felt like a very true statement. But basically I just became a middleman to ChatGPT and Copilot to harden the site as much as possible. I didn't come up with the term harden. They both kept saying they were hardening the site back and forth to each other.

## Was It All Worth It?

Yes, absolutely. Not because the process was glamorous. It wasn't. Not because we suddenly became expert developers. We didn't, although we learned a lot and I can speak somewhat basic computer talk.

But because the original goal was achieved. We now have a site that looks very similar to what we had before, but it runs on infrastructure we understand better and control ourselves and it doesn't really cost us anything except our domain, which we already purchased until 2035.

## Miscellaneous

You can now watch our films through our Vimeo OTT. So you can go to say The Powwow on our site and click Watch Movie. It will redirect you to the subdomain name of watch.greatgusproductions.com and then you can start watching. You don't necessarily have to go through our main site. You can just go to watch.greatgusproductions.com and find all three films. The other two films you will need to subscribe to watch. We make sure you pay something because it helps the cast and crew of those films and because they are for mature audiences only. If you run into issues, hit us up on our contact page. It's new and has only been used for test messages.

Our swag can be found on the Shop page found in the About drop-down menu. I tried finding 100% organic materials, but idk I think our country is trying to poison us because the hoodie is only 80% organic cotton in America, while in every other country Printful will ship it 100% organic cotton. All seems so silly. Just make the whole thing organic cotton.

Kindest regards,
GGP

## #BlogShtuffs #BuildShtuffs #TrulyIndie