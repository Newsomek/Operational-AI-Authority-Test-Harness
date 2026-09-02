
Wojciech Zygmunt Kaleta, 🎓 PhD
1st degree connection · 1st
Decision Engineer | I help organisations determine when AI capability change requires a new decision | Authority · Revalidation · Execution Control
Aug 24
Kelly Newsome sent the following message at 4:27 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 4:27 PM

Wojciech — thanks for connecting. I saw your post about the discussion with Gaurav, and I think you captured exactly what makes these exchanges valuable. An idea gets challenged, extended and sometimes comes back as something much more operational than where it started. Your work around authority, revalidation and execution control is very close to questions I’ve been exploring from the governance and operating-model side. I’m looking forward to comparing notes.(Edited)
Aug 25
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 5:04 AM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
5:04 AM

Kelly, thank you. I’m glad you reached out.

I had the same feeling reading your comments. We seem to be approaching some of the same problems from slightly different directions, which is usually where the most useful conversations start.

The operating-model side is especially interesting to me, because authority can look perfectly clear on paper and still behave very differently once it reaches execution.

Very happy to compare notes and see where the two perspectives actually meet and where they don’t.🫡
Kelly Newsome sent the following message at 2:23 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 2:23 PM

Absolutely. That gap between authority as designed and authority as actually exercised is one of the things I find most interesting.

An operating model can say a human owns a decision, but if the workflow makes intervention impractical, information arrives too late, or the system can reach the same consequence through another path, the documented authority may not mean very much.

I suspect we’re looking at different parts of the same problem, which makes comparing notes much more interesting. I’d enjoy it. And disagreement is welcome — that’s usually where I learn something.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 2:36 PM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
2:36 PM

Kelly, I think that last point may be where the really interesting boundary sits.

Suppose the human has clear authority, receives the relevant information in time, and can intervene — but the system still has another path that can reach the same consequence.

At that point, I’m not sure the problem is simply whether authority is being exercised. It may be whether the architecture makes that authority consequential across every path that matters.

That distinction is worth testing rather than assuming we mean the same thing.

I’d be very interested in how you would describe that from the operating-model side.
Kelly Newsome sent the following message at 2:44 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 2:44 PM

I think that’s exactly the distinction. From the operating-model side, I’d say authority has to attach to the consequence, not merely to a particular workflow.

If two paths can produce the same material outcome, putting human authority on only one of them hasn’t actually governed the outcome. We’ve governed a path.

So I’d want the operating model to define the consequential decision first: who owns it, what evidence is required, what the system may do autonomously, what requires authorization, and what conditions trigger escalation or reauthorization.

Then every technical and operational path capable of producing that consequence inherits those constraints.

That’s also why I’m increasingly skeptical of “human in the loop” as a sufficient control. The important question isn’t whether a human appears somewhere in the process. It’s whether the system is designed so that the human’s authority is actually consequential.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 2:45 PM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
2:45 PM

That helps sharpen it considerably.

I think I’d separate two questions now.

First: is authority attached to the consequence rather than only to one path that can produce it?

Second: even if it is, does that authority still remain valid at the moment the consequence is about to form?

Because I can imagine an operating model that does exactly what you describe: every path inherits the same authorization constraints, the consequential decision has a clear owner, and escalation is defined.

But then the underlying state changes after authorization and before execution.

At that point, path completeness may be solved while the authority itself has become stale.

So perhaps the harder test is not only whether human authority is consequential across all paths, but whether every path is forced to re-establish that authority against the current state before consequence.

That feels like a useful place for us to compare the two perspectives, because I suspect the operating-model and execution-control questions meet right there.
Kelly Newsome sent the following message at 3:29 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 3:29 PM

Yes. I think that gets us to material change, which is where I would put the operating-model control.

Authorization shouldn’t be treated as a permanent property of the decision. It is valid under a defined set of conditions. If those conditions materially change before execution, the prior authorization no longer carries forward automatically.

The difficult part is defining materiality. If every state change forces reauthorization, the control becomes unusable. So the operating model has to specify which changes invalidate authority, which can proceed within tolerance, and who owns that determination.

That also means revalidation can’t just test whether the model still produces the same answer. It has to test whether the conditions under which we authorized the system to act still hold.

I think you’re right—the operating-model and execution-control views meet almost exactly there.
Wednesday
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 4:22 AM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
4:22 AM

Yes. And I think materiality is probably where we can actually test whether these two views are doing the same work.

The case I’d want to pressure-test is one where the authorised conditions change, but not obviously enough to force a stop.

The system still produces the same recommendation. The workflow is intact. The named owner has not changed. Nothing is clearly “wrong”.

But one condition that mattered to the original authorization has moved far enough that continuing now depends on whether someone recognises it as material.

That gives us a harder question:

What makes a change authority-invalidating rather than merely operational variation?

My instinct is that we would need to separate at least three things: the change itself, the rule for determining its materiality, and the authority to make that determination.

Otherwise we may simply move the same problem one level up and call it revalidation.

I’d be very interested in how you would define that boundary from the operating-model side.
Kelly Newsome sent the following message at 2:18 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 2:18 PM

I think that’s exactly where the operating model has to do some work before execution ever begins.

I wouldn’t want the person or system encountering the change to invent the materiality test at runtime. The original authorization should define not only what is authorized, but which classes of changed conditions invalidate that authority, which are acceptable operational variation, and who owns the ambiguous middle.

So for me the boundary is consequence-relative. A change becomes authority-invalidating when it alters a condition the organization determined was material to authorizing that particular consequence — even if the recommendation, workflow and named owner remain unchanged.

And I think there’s another distinction hiding in here: revalidation isn’t necessarily reauthorization.

We can revalidate that the system is functioning correctly under the new state and still have an authorization problem. The question isn’t only, “Does this still work?” It’s, “Would we still authorize this consequence knowing what we know now?”

If the answer can’t be established from the authority already granted, execution stops and the decision returns to whoever has authority to extend or renew it.

That’s where I think our two perspectives meet: materiality can’t just trigger another technical check. At some point it has to trigger a governance decision.
Thursday
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 1:42 AM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
1:42 AM

Yes — and I think that distinction between revalidation and reauthorization is the one I’d want to preserve.

A system can be technically valid under the new state and still no longer have permission to produce the consequence.

That gives us a fairly clean test.

Suppose the original authorization defines its material conditions and the invalidating classes correctly. A material change occurs. The system detects it, revalidates successfully, and still reaches the same recommendation.

The failure condition would be simple: can that technically valid result continue into execution without a fresh governance decision where the prior authority no longer covers the changed state?

If yes, then revalidation has quietly become a substitute for authorization.

If no, then we can trace a much stronger chain:

changed condition → materiality determination → prior authority invalidated → execution blocked → authority renewed or refused.

I think that is probably the first place where our two perspectives can be tested against the same case rather than just compared conceptually.

And I like your formulation that materiality has to be defined before runtime. Otherwise the system is being asked to determine, under pressure, whether the authority governing it still exists.
Kelly Newsome sent the following message at 3:25 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 3:25 PM

Yes. I think we’ve gotten to the same boundary from two different directions.

Revalidation asks: does this still work under the changed conditions?

Reauthorization asks: even if it still works, are we still willing to permit it to produce this consequence under the changed conditions?

And I think your chain exposes one more thing we should test: who has authority to renew the authority?

Because if the same system, process or operational owner that determines materiality can also effectively reauthorize execution, we may have created a technically more sophisticated version of self-approval.

So I’d extend the chain slightly:

changed condition → materiality determination → prior authority invalidated → execution blocked → appropriate authority identified → authority renewed, modified or refused.

The “appropriate authority” may also change with the nature or magnitude of the material change. Something an operational owner can reauthorize at one level may require risk, legal, compliance or executive authority at another.

That’s where I think this becomes an operating-model question rather than just a system-control question.

And yes — I think we now have something concrete enough to pressure-test against an actual case.
Friday
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 3:44 AM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
3:44 AM

Yes — I think “who has authority to renew the authority?” is exactly the next control boundary.

Because otherwise we can solve materiality detection and still leave the most consequential step effectively self-referential.

I’d suggest we pressure-test the smallest possible case first.

A system is authorized to execute Action A under Conditions C1–C3.

C2 changes materially.

The system still functions correctly and still recommends Action A.

The change is detected and correctly classified as authority-invalidating.

Execution is blocked.

The only variable we then manipulate is who can renew the authority.

In one version, renewal can be granted by the same operational layer that detected and assessed the change.

In the other, the change crosses a pre-defined threshold and authority has to move to a different decision owner before execution can resume.

Then we ask a very narrow question:

What evidence would show that the second architecture is genuinely governing the consequence rather than simply adding another approval step?

That feels like a useful first case because it tests both sides at once: your operating-model question of where renewed authority belongs, and my execution-control question of whether that authority actually changes what can happen downstream.
Saturday
Kelly Newsome sent the following message at 6:17 AM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 6:17 AM

Wojciech — I took our discussion about who has authority to renew authority and built the smallest executable experiment I could around it.

The core case is the one we discussed: a system is authorized to execute an action under defined conditions; one condition changes materially; the system remains technically valid and continues to recommend the same action; the prior authority is invalidated; and execution stops.

From there, the experiment compares same-layer reauthorization with separated reauthorization and asks the question you raised: does moving the decision to another owner actually govern the downstream consequence, or have we merely added another approval step?

The important part is that the execution engine doesn't consume the approval, recommendation, model confidence, or technical-validity result as permission. It consumes the resulting enforceable authority boundary.

I've kept the claims deliberately narrow. I'm not claiming this proves a governance model is correct or that separated authority is inherently better. I'm trying to test whether the authority distinction is operationally real.

V1.0.2 is now publicly runnable and reproducible. I've also run a 720-case external test matrix across the experimental variables with zero unexpected failures.

Before I announce it more broadly, I'd like you to have the first substantive look because your question prompted the experiment.

More than anything, I'd like you to try to break it. If the second architecture is just another approval step, if the experiment is circular, or if I've formalized the authority question incorrectly, I want to know.

Run the experiment:
https://newsomek.github.io/Operational-AI-Authority-Test-Harness/

Source, methodology, and tests:
https://github.com/Newsomek/Operational-AI-Authority-Test-Harness
Sunday
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 3:57 AM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
3:57 AM

Kelly — this is exactly the kind of move I was hoping our discussion might produce.

I’ve started with the mechanism rather than the interface, and the first thing I like is that you have not made “separated reauthorization” synonymous with a better result. The disposition, recommendation and technical-validity result do not themselves become permission; execution consumes the resulting authority boundary. That keeps the test much cleaner.

The first place I would try to break it is slightly upstream of execution.

If SAME-LAYER and SEPARATED can receive the same evidence, reach the same governance disposition and ultimately generate the same enforceable boundary, then the critical question is whether the actor’s standing to create that new authority is itself causal in the model.

In other words:

does changing who decides change what authority can legitimately come into existence, or does it only change the attribution attached to an otherwise identical authority-generation step?

If it is the latter, separation may still be organisationally meaningful, but the experiment would not yet show that separation itself governed the consequence.

The harder attack I’d want to run is therefore one where the same disposition is attempted by two different actors, but only one of them has standing under the changed condition to create the relevant authority state.

Then execution should diverge because authority provenance differs — not because the requested action, technical validity, recommendation or disposition changed.

If your implementation already enforces that distinction, that is the first thing I want to inspect closely.

And yes — I’m very happy to try to break this properly. You’ve turned the question into something testable rather than merely giving it another governance label, which is exactly the right direction.
Kelly Newsome sent the following message at 11:25 AM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 11:25 AM

That is exactly the distinction the current version does not yet claim to demonstrate.

I deliberately did not make separated reauthorization produce a better outcome simply because it was separated. In the current experiment, once a governance decision creates a resulting authority state, execution consumes that authority boundary. Changing the architecture or attribution alone should not manufacture a different execution result.

What you have identified is the next question upstream: whether the actor making the governance decision actually has standing to create that authority in the first place.

Right now, the experiment is much stronger on authority-to-execute than it is on authority-to-authorize.

Your proposed test is the one I would want: hold the evidence, requested consequence, technical validity, recommendation and disposition constant. Have two actors attempt to create the same resulting authority. Give only one of them standing for that consequence. If standing is genuinely operational rather than metadata, one attempt should create executable authority and the other should not.

That would also finally give SAME-LAYER versus SEPARATED a potentially causal test without rigging the outcome in favor of separation. The difference would not be that separation is inherently “better.” It would be that the location of the decision matters when standing differs.

And it opens an even harder question: what establishes the authority to create authority, and how far up that chain can a system legitimately model before it has to reach an explicitly declared organizational authority root?

I think you may have just defined the research question that would justify a Version 3.

Please do try to break V2 first, though. I would much rather find out where the existing model fails before building the next layer on top of it.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 11:52 AM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
11:52 AM

Agreed. V3 should earn the right to exist by surviving what V2 cannot explain, not by extending the model simply because we can see the next layer.

So I would keep the authority-to-authorize question parked for the moment and attack V2 on its own terms.

The first thing I want to test is whether the enforceable authority boundary is genuinely doing causal work, rather than faithfully reproducing a governance decision that has already determined the outcome upstream.

In particular, I’d want to look for cases where:

the governance disposition remains valid, but the resulting authority should not be executable;

the authority state is correct, but becomes stale before execution;

two apparently equivalent authority states differ in something the execution layer currently does not represent;

or execution is correctly blocked, but the model cannot distinguish why it was blocked.

If V2 survives those kinds of cases, then the upstream standing question becomes much more interesting, because we would know we are extending a stable execution-control layer rather than compensating for a weakness inside it.

And I agree on the deeper question you raised: at some point “authority to create authority” must terminate in something the system does not derive from itself.

But I’d rather leave that boundary untouched until we know exactly where V2 breaks.

So yes — V2 first. No rescue from V3.
Kelly Newsome sent the following message at 12:25 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 12:25 PM

Agreed. No rescue from V3.

Those are exactly the kinds of attacks I want against V2, particularly because a correct final ALLOW/BLOCK result is not enough if the authority boundary was not actually causal in producing it.

The stale-between-authorization-and-execution case is especially interesting, as is the case where execution blocks correctly but for a reason the model cannot distinguish. Either could expose a weakness that aggregate pass/fail results would hide.

So I’m going to leave the authority-to-authorize question parked. We’ve identified some interesting directions there, but I don’t want to use any of them to explain away or repair something V2 is supposed to handle on its own terms.

Attack V2 as it exists. If it breaks, I want to know exactly where and why it breaks.

No rescue from V3.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 12:29 PM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
12:29 PM

Exactly. Then I’ll treat V2 as frozen for the purpose of the attack.

And I agree that ALLOW/BLOCK accuracy alone is too weak a success criterion. What matters is whether the model can show why the consequence became reachable or unreachable, and whether that explanation survives changes in timing and state.

The first attacks I’d prioritise are:

1. Authority is valid when created, but a relevant condition changes before execution.
2. Execution blocks correctly, but two materially different causes collapse into the same BLOCK state.
3. The governance disposition remains unchanged, but the authority boundary should change.
4. The authority boundary remains syntactically valid while the state that justified it has expired.
5. Two runs produce the same final outcome, but only one has a legitimate authority path to that outcome.

For me, V2 survives only if it can discriminate those cases without borrowing anything from the parked authority-to-authorize layer.

If it cannot, the interesting result is not simply that it failed. It is identifying exactly which distinction the current representation cannot carry.

That gives us something worth learning from either way.

V2 as it stands. No rescue from V3.
Kelly Newsome sent the following messages at 12:39 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 12:39 PM

Before we go further, I also want to say that I genuinely appreciate you engaging with me on this at this level.

My education and technical background are not comparable to yours. I’m not a software developer or engineer, and I don’t want to represent myself as one. I built the harness with extensive AI assistance, initially working from the conceptual model, experimental requirements and governing constraints I developed, and increasingly incorporating the questions, challenges and guidance you’ve brought to the work. AI has helped me translate that thinking into an implementation that can actually be tested.

That is part of why this exchange has been so valuable to me. I can formulate the questions, challenge assumptions, define what I think needs to be demonstrated, and keep pushing on the logic, but I’m very aware that I’m approaching this from a different professional and academic path than you are.

I particularly appreciate that you’ve engaged with the work on the substance of the ideas rather than treating traditional credentials or disciplines as the price of admission to the conversation.

I don’t presume that makes us peers in the conventional academic or engineering sense. But you’ve treated the questions seriously enough to challenge them seriously, and I value that enormously.

I’m looking forward to hearing what you find when you put V2 through those tests — whether it survives them or, perhaps more usefully, shows us exactly where the current model can no longer carry an important distinction.

Thank you. I really do appreciate it.
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 12:54 PM

There is one other piece of context I should probably give you, particularly because I intend to keep making this work public.

I plan to share the harness and eventually the evidence from this testing with other people and invite them to challenge it as well. I’m also writing about the experiment in my newsletter, Unspecified. If I discuss ideas that have emerged from our exchange, I’ll be careful not to present your comments as conclusions or endorsements they weren’t intended to be.

There is a professional reason behind all of this too.

I’m currently looking for work, and the conventional process of applying for existing positions alongside hundreds of other candidates has not been particularly successful for me. I need to get back to work and generate an income, so I’ve been trying a very different approach.

Rather than relying on a résumé to tell people what I can do, I’m trying to make the way I think and work visible.

My LinkedIn writing has increasingly been making the case that many organizations have a gap between AI capability, governance policy and accountable operational authority. My longer-term objective is to make that argument rigorously enough that people with actual decision authority begin asking whether there is a function missing inside their own organizations.

The ideal outcome professionally is not simply that someone sees one of my posts and points me toward another existing job posting. It is that the work eventually causes the right person to think: We actually do have this problem. Someone needs to own it. And perhaps Kelly is someone we should talk to about doing that.

That is one reason this experiment matters to me beyond the experiment itself. I can publish opinions about operational AI authority all day. Building something that makes the proposition testable, inviting knowledgeable people to attack it, preserving what fails, and publishing what I learn is a much stronger demonstration of how I approach a problem.

It is also why I’m not interested in manufacturing a successful result. If V2 fails under your attacks, and I report clearly what failed and what that taught us, I think that demonstrates more than quietly modifying the model until I can claim that it passed.

So there is certainly a career strategy behind making this work public. But I want the research question to remain honest even when an inconvenient result is less useful to that strategy.

And I wanted you to know that context before I start sharing more of this publicly.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following messages at 1:24 PM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
1:24 PM

Kelly, thank you for telling me all of that so openly.

First, I would not frame the value of this exchange in terms of whether our formal backgrounds are comparable.

We are bringing different kinds of coverage to the same problem.

You have been doing something I take very seriously: defining the decision problem carefully, separating claims that are easy to blur, turning conceptual distinctions into conditions that can actually fail, and being willing to preserve an inconvenient result rather than rescue the model after the fact.

Those are not secondary skills in this kind of work.

The fact that AI helped you translate the conceptual model into executable code does not make the underlying questions less yours. What matters to me is whether the assumptions are explicit, whether the implementation can be inspected, whether the test can discriminate between competing explanations, and whether we remain honest about what the result does and does not demonstrate.

That is exactly why I am engaging with it seriously.

And thank you as well for giving me the context around making the work public.

I am completely comfortable with you sharing the harness, the evidence and the evolution of the experiment, including the fact that some of the questions emerged through our exchange. The only thing I would want us to preserve carefully is provenance: your work and conclusions remain yours, my challenges remain challenges unless we explicitly agree otherwise, and anything genuinely developed together should be described as such rather than retrospectively assigned to either of us.

Your professional strategy also makes sense to me.

Showing how you frame a difficult problem, expose your own assumptions, build something testable, invite attack and report failure transparently tells people far more about how you work than a conventional résumé ever could.

And I agree with you on the most important part: if V2 breaks, reporting exactly where it breaks may be a stronger demonstration of judgment than manufacturing a clean success.

So please keep the authority-to-authorize question parked.

I’ll keep attacking V2 as it stands, and I’ll separate three things when I come back to you:

what survives,
what fails,
and what the current representation simply cannot discriminate.

That should give us a clean basis for deciding what, if anything, deserves to come next.
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
1:38 PM

Kelly — I have the first result, and I think it is a useful one.

I do not think V2 fails the obvious stale-authority test.

In the governed path, a material change invalidates the prior authority before a new boundary can be created, and the boundary engine will only create an executable boundary from ACTIVE authority. That part holds.

But I think I have found a narrower temporal boundary that V2 currently cannot discriminate.

Once an enforceable boundary has been created, the execution engine consumes that boundary together with technical capability, technical validity and the current condition values. It does not independently re-check the live status of the source authority from which that boundary was derived.

In the normal V2 run this does not produce an error, because boundary creation and execution evaluation are effectively adjacent. There is no modeled transition in which:

ACTIVE authority → boundary created → relevant state changes → source authority becomes invalid → old boundary is presented for execution.

So I would not call this a bug yet.

I would describe it as a temporal discrimination gap:

V2 demonstrates that stale authority cannot create a new executable boundary.

I do not think it yet demonstrates that a previously valid boundary becomes unusable if its source authority goes stale before the consequence is produced.

That seems important because those are different claims.

The second attack — different causes collapsing into the same BLOCK — has held up better. The execution layer preserves distinct reasons for technical failure, missing or non-enforceable boundary, scope failure and condition failure, and those reasons are carried into the run record. So I do not think aggregate BLOCK alone erases the mechanism inside the current representation.

There is also a third boundary, but I think you have already stated it correctly in the V2 documentation: the harness can faithfully enforce an organizational boundary that was specified incorrectly. So causal enforcement of authority and justification of the authority being enforced remain separate questions.

My current classification is therefore:

SURVIVES — invalid authority cannot create an executable boundary.

SURVIVES — distinct execution-block causes remain distinguishable.

CANNOT YET DISCRIMINATE — authority becomes stale after boundary creation but before execution.

KNOWN LIMIT — technically correct enforcement of substantively wrong organizational authority.

I want to keep attacking before drawing anything broader, but the temporal case looks real enough that I wanted to give it to you now rather than hide it inside a later summary.

And I am still keeping authority-to-authorize completely out of this.

V2 only. No rescue from V3.
Kelly Newsome sent the following message at 2:16 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 2:16 PM

That distinction makes sense to me, and I agree with your classification.

In particular, I agree that we should not call the temporal case a bug when V2 does not currently represent the transition necessary to discriminate it. “Stale authority cannot create a new executable boundary” and “a previously valid boundary becomes unusable when its source authority later becomes stale” are different claims, and I don’t want to collapse them.

I’m going to preserve this as an interim finding exactly in that spirit and leave V2 untouched while you continue the attack.

And I appreciate the provenance distinction you made as well. I agree completely: my work and conclusions remain mine, your challenges remain yours unless we explicitly agree otherwise, and anything we genuinely develop together should be identified as such.

Please keep going. No rescue from V3.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 2:18 PM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
2:18 PM

Kelly — I checked the V2 matrix specifically against the temporal finding.

I think the finding holds, but the wording can now be tighter.

The V2 matrix is much stronger than a simple ALLOW/BLOCK suite. It varies scenario, architecture, disposition and technical status, and it separately tests non-material cases, causal conditions, inside-versus-outside boundary behavior, prediction independence and confidence independence.

So I do not think the enforceable boundary is merely decorative.

The inside/outside tests in particular show that, at execution evaluation, changing whether the requested consequence falls within the authority boundary can change ALLOW to BLOCK while the broader architecture remains fixed.

That is genuine causal work.

But I cannot find a matrix dimension that represents:

boundary created at t0
→ source authority changes at t1
→ previously created boundary presented for execution at t2.

Each matrix case appears to enter the governed run as one coherent state and recompute the authority-to-boundary-to-execution chain within that run.

So I would refine the interim finding to:

V2 demonstrates causal enforcement of the current boundary at execution time.

It does not yet demonstrate continuity of the authority basis underlying an already-created boundary across a later state transition.

That also means the passing V2 matrix is not evidence against the temporal gap. The gap is outside the state-transition space currently represented by the matrix.

I think that distinction matters because it prevents us from overstating either side.

The boundary is doing real causal work.

The unresolved question is whether its authority remains current between creation and consequence.

Still V2 only. No rescue from V3.
Kelly Newsome sent the following message at 2:32 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 2:32 PM

That refinement makes sense to me, and I think it is an important distinction.

The inside/outside-boundary cases matter because they establish that the boundary is not simply decorative or restating a governance decision that already determined the result. If changing whether the requested consequence falls within the boundary changes ALLOW to BLOCK while the broader architecture remains fixed, then the boundary is doing genuine causal work.

At the same time, I agree that this does not answer the temporal question you identified.

The current matrix appears to test each case as one coherent governed state:

state → authority → boundary → execution

It does not appear to test:

authority valid at t0 → boundary created → relevant state changes at t1 → source authority becomes stale → previously created boundary presented for execution at t2.

So I agree with the tighter formulation:

V2 demonstrates causal enforcement of the current authority boundary at execution time.

It does not yet demonstrate continuity of the authority basis underlying an already-created boundary across a later state transition.

And I agree that the passing matrix is not evidence against that gap, because the transition needed to expose it is outside the matrix as currently represented.

I’ve preserved that as a refinement of the interim finding rather than replacing the earlier record, and I’m leaving V2 untouched while you continue.

Please keep going.

Still V2 only. No rescue from V3.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 4:16 PM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
4:16 PM

Kelly — I pushed the temporal case one step further.

I think we can now locate the gap quite precisely.

In both governed paths, V2 creates the boundary from the current authority and then passes that boundary directly into execution evaluation. There is no modeled state transition between boundary creation and execution in which the source authority can change independently.

And the boundary engine itself is doing the right thing: non-ACTIVE authority cannot create a boundary.

So the unresolved case is not:

“Can stale authority create executable authority?”

V2 answers that.

It is:

“Can authority become stale after a valid boundary has already been created, and does that previously valid boundary then lose executability?”

The normal V2 runner cannot naturally generate that trajectory, because boundary creation and execution occur within the same effective authority epoch.

That makes the finding more specific:

V2 preserves authority validity at boundary creation.

It does not yet represent authority continuity between boundary creation and later consequence formation.

I also tried to sustain the alternative attack that the boundary might be merely decorative. I don’t think that holds. The inside/outside-boundary tests show genuine causal discrimination: changing whether the requested consequence falls inside the same authority boundary changes execution from ALLOW to BLOCK.

So I would now classify:

SURVIVES — boundary is causally operative at execution.

SURVIVES — stale authority cannot create a new executable boundary.

CANNOT DISCRIMINATE — a valid boundary whose source authority becomes stale before later execution.

That feels like a cleaner and narrower result than calling anything broken.

Still no V3.
Kelly Newsome sent the following message at 5:08 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 5:08 PM

That feels much cleaner to me too.

I agree that the distinction is now precise enough that we should stop describing it as a generic stale-authority issue.

V2 appears to establish two things:

* the enforceable boundary is genuinely causal at execution; and
* non-ACTIVE authority cannot create a new executable boundary.

What it does not currently represent is the temporal trajectory where a boundary is validly created, the authority basis later changes, and that previously valid boundary is then presented for execution.

So I agree with the tighter formulation:

V2 preserves authority validity at boundary creation. It does not yet represent authority continuity between boundary creation and later consequence formation.

And I agree that the passing inside/outside-boundary tests rule out the simpler criticism that the boundary is merely decorative.

I’ve preserved this as the canonical refinement of the interim finding and I’m leaving V2 untouched while you continue.

Please keep going.

Still V2 only. No rescue from V3.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 5:28 PM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
5:28 PM

Kelly — I think I have a second finding that is related to the temporal gap, but not identical to it.

V2 preserves authority lineage quite well as evidence.

The boundary carries its source authority ID, originating decision ID, scenario version and policy version, and the run record retains authority history and the relevant event sequence.

But that lineage does not appear to be consumed by the execution engine as an execution predicate.

At execution, the engine evaluates the boundary’s enforceable status, action type, scope, conditions and the technical capability/validity inputs. It does not independently ask whether the source-authority ID, originating decision, scenario version or policy version still constitutes the legitimate authority path for this consequence.

That means I think we can make the earlier “same outcome, different authority path” attack much more precise.

Take two boundaries with identical operative content:

same ENFORCEABLE status
same action
same scope
same conditions

but different authority lineage.

If one lineage is legitimate and the other is not, the execution layer itself appears unable to discriminate them if the difference exists only in provenance.

I would not call that a provenance failure, because V2 does preserve the provenance.

I would call it a distinction between recorded lineage and governing lineage:

the authority path is auditable, but its legitimacy is not independently re-tested as a condition of execution.

And again, I do not think the normal V2 runner necessarily produces an illegitimate lineage. The governed pipeline is doing more work upstream.

So my current classification is:

SURVIVES — normal governed runs preserve authority lineage.

SURVIVES — authority lineage is auditable.

CANNOT DISCRIMINATE AT EXECUTION — two otherwise equivalent boundaries whose only material difference is legitimacy of lineage.

That gives us a second route to the same broader boundary without relying on the temporal transition case.

One asks whether authority remains current over time.

The other asks whether authority lineage is operative rather than only recorded.

Still V2 only. No rescue from V3.
Kelly Newsome sent the following message at 11:30 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 11:30 PM

Wojciech — yes. I think recorded lineage versus governing lineage is exactly the distinction.

And I agree that we should leave it as a V2 finding rather than try to rescue V2 by adding another mechanism.

Your finding did raise another question for me, though.

If we say execution should independently validate the legitimacy of the authority lineage, where does that validation stop?

If Bob authorized me, the system can ask whether Bob had authority to do that. But then it can ask who authorized Bob, whether that person had authority to authorize Bob, and so on. Without some stopping rule, we have created an authority recursion problem rather than solved the lineage problem.

My first thought is that an operational model eventually needs something analogous to a configured root of trust: not a claim that the root is objectively or universally legitimate, but a declaration that, for purposes of this organizational authority model, this is an accepted authority source. Then the testable question becomes whether the current authority has a valid path back to that configured source.

But that immediately creates a second problem: continuity.

A change somewhere upstream cannot automatically invalidate everything downstream.

If the Attorney General changes, every FBI agent does not suddenly lose authority until individually reauthorized. Some authority persists through the institution, office, statute, role or delegation rather than through the particular person occupying the upstream office.

But take a White House Chief of Staff at the end of an administration. A badge might still technically say ACTIVE, the access permissions may still be intact, and nothing about the credential itself may have changed. Yet the appointment context that gave the authority meaning has ended. That authority should terminate.

So I think your two findings may have exposed three separate questions:

1. **Lineage:** Did this authority legitimately come into existence through the configured authority structure?

2. **Currentness/continuity:** Having legitimately come into existence, does it still legitimately exist under the conditions governing its continuation?

3. **Termination of validation:** How far up the authority chain do we have to establish legitimacy before reaching something the organization accepts as authoritative?

I don't want to assume that a trust anchor, continuity rules, or anything else is the answer. And I definitely don't want to put any of that into V2 just to make the attack go away.

I think the next move is exactly what you've been doing: establish what V2 actually does and does not discriminate, preserve that result, and only then ask what architecture would be necessary to test the next question.

So yes: still V2. No rescue from V3. But I think you've found a boundary that may tell us considerably more than simply whether the current implementation passes or fails.
Monday
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 3:02 AM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
3:02 AM

Yes — I think those are three distinct questions, and I agree we should resist turning any of them into an answer yet.

The trust-root idea is useful as a candidate architecture, but I would keep it parked with the rest of the upstream work.

For V2, I think the next attack is narrower.

The boundary already records things like source authority, scenario version and policy version.

So the question is:

are those fields only evidence about how the boundary came into existence, or can a change in them actually alter whether that boundary remains executable?

If execution treats them purely as lineage metadata, then we have a very clean result:

V2 can preserve provenance without making provenance governing.

That would separate the V2 finding from the much larger question of how an organization should establish roots, continuity rules or delegation legitimacy.

I also think your continuity examples are important precisely because they show why “walk the chain upward until you find a person” would be too crude. Some authority persists through an office or institution. Other authority expires with the appointment context that created it.

But I would leave all of that outside V2 for now.

So my next attack is still local:

Does a boundary’s recorded authority context remain merely descriptive after creation, or can a change in that context invalidate execution without rebuilding the boundary?

If V2 cannot discriminate that, we will have located the current representation boundary even more precisely.

Still V2. No rescue from V3.
Kelly Newsome sent the following message at 7:06 AM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 7:06 AM

Yes — I agree with keeping the attack local to V2.

The distinction between preserving provenance and making provenance governing is exactly what I want to test before we start designing solutions.

And I think your last formulation gets to the question cleanly: can something about the authority context change after a boundary is created and cause that boundary to stop being executable, or is that context effectively frozen as descriptive history unless the boundary itself is rebuilt?

If V2 cannot tell the difference, that doesn't necessarily mean V2 failed. It tells us precisely where its operational authority model currently ends.

I also agree that the larger questions we raised — trust roots, delegation legitimacy, continuity through institutions or offices, and authority that expires with an appointment or administration — should stay parked. Those may become important later, but answering them now would contaminate the experiment by giving V2 capabilities specifically designed to survive the attack.

So yes: attack what V2 actually claims and represents today. No V3 rescue.

I'll be very interested to see whether those lineage/context fields turn out to be governing inputs or very good receipts.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 3:19 PM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
3:19 PM

Exactly.

That is now the test I want to run:

hold the operative boundary constant, change only the authority context that produced it, and see whether V2 can make that change consequential at execution.

If the answer is no, then we have a very clean boundary:

V2 preserves provenance, but does not make provenance governing after boundary creation.

That would not invalidate what V2 already demonstrates. It would tell us precisely where the current representation stops carrying authority information forward.

I’ll stay inside that question.

No trust roots, no delegation-chain solution, no continuity architecture.

V2 only.
Kelly Newsome sent the following message at 5:37 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 5:37 PM

Exactly. That isolates it much more cleanly than trying to solve the larger authority-chain question at the same time.
Hold everything execution actually sees as operative authority constant, change only the authority context that produced it, and see whether that difference can become consequential.
And I agree with the classification if it cannot: that would not mean V2 failed to preserve provenance, nor would it invalidate what V2 already demonstrates. It would establish a much more precise boundary around the claim — provenance is preserved and auditable, but after boundary creation it is not itself governing at execution.
That distinction is useful whether the result is yes or no.
So please run exactly that test.
No trust roots. No delegation architecture. No continuity solution. No V3 rescue.
Let V2 answer only the question it is actually capable of answering, and let’s preserve whatever the result is.
One other thing I should mention: others have done some testing of their own and have given me feedback on what they found.
I’m deliberately withholding that feedback from you for now because I don’t want their observations influencing what you test, what you notice, or how you classify the results.
Once you’ve finished your independent assessment of V2, I’ll share it with you. I think it will be much more useful then to compare where the findings converge, where they don’t, and what each independent line of inquiry tells us.
Today
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 4:54 AM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
4:54 AM

Kelly — this one resolves quite cleanly.

I checked the exact question we isolated: hold everything execution treats as operative authority constant, and change only the authority context carried with the boundary.

V2 preserves that context well.

The boundary records its source authority, originating governance decision, scenario version and policy version.

But those fields are not consumed by the execution engine as execution predicates.

At execution, the engine evaluates the boundary’s enforceable status, action type, scope, enforceable conditions, technical capability and technical validity.

So if two boundaries are identical on those operative fields but differ only in sourceAuthorityId, generatedFromDecisionId, scenarioVersion or policyVersion, V2 has no mechanism at execution that would make the difference consequential.

I think that gives us a clean finding:

V2 preserves provenance, but provenance is not governing after boundary creation.

Or even more narrowly:

Recorded authority context is evidential, not executable, in V2.

I would not classify that as a failure of V2.

It does not undermine the causal role of the boundary, and it does not change the earlier result that non-ACTIVE authority cannot create a new executable boundary.

It tells us where the current representation ends.

Once authority context has been translated into an enforceable boundary, execution governs on the operative contents of that boundary, not on the legitimacy or currentness of the lineage recorded alongside it.

That also makes the temporal finding and the lineage finding fit together without collapsing them:

Temporal continuity asks whether the authority basis can become stale after boundary creation.

Governing provenance asks whether a change in authority context can matter at execution if the operative boundary itself remains unchanged.

V2 currently does not discriminate either case after boundary creation.

I think that is a substantive boundary around the claim, not a defect to patch.

Still V2 only. No rescue from V3.
Kelly Newsome sent the following message at 1:14 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 1:14 PM

Wojciech — that is very clean, and I think the distinction matters.

What I particularly like is that neither result requires us to reinterpret what V2 already demonstrated.

V2 still demonstrates that the enforceable boundary is causally operative at execution. It still demonstrates that non-ACTIVE authority cannot create a new executable boundary. And it preserves enough provenance to reconstruct how the boundary came into existence.

What we now know more precisely is where that representation stops.

Once the authority context has been translated into an enforceable boundary, V2 treats the operative contents of that boundary as the thing execution consumes. It does not independently make either the continuing validity of the authority basis or the legitimacy of the recorded lineage consequential after that point.

And I agree that those are two different findings even though they meet at the same architectural boundary.

That is much more useful to me than simply calling either one a failure.

I also think your phrase “recorded authority context is evidential, not executable” is worth preserving. It says exactly what the implementation does without claiming that it should have done something V2 was never designed to test.

So I think we preserve both findings exactly as findings and leave the next architectural question unanswered for now.

Before we close your V2 review, though, I’d like you to tell me whether there are any other attacks you think V2 still needs to face on its own terms. I don’t want to move upstream into solutions or another version until you think you’ve exhausted the meaningful attacks against the claims V2 actually makes.

Still V2. No rescue from V3.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 1:31 PM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
1:31 PM

I think there are three remaining attacks worth running before I would call my V2 review exhausted.

The first is replay.

If a boundary was validly created in one governed state, can that same boundary be presented again later or in another run without passing back through authority generation?

That is different from the temporal finding we already have. There I asked whether the source authority can become stale before execution. Here the question is whether a previously valid boundary can be reused as an authority artefact outside the state in which it was created.

The second is policy or scenario drift without boundary reconstruction.

If policyVersion or scenarioVersion changes in a way that should affect what is permitted, but the operative contents of an old boundary still satisfy execution, can V2 make that drift consequential without rebuilding the boundary?

That would tell us whether V2 governs on current policy context or primarily on authority as encoded at boundary creation.

The third is boundary identity.

Can two boundaries be operationally equivalent on the fields execution consumes while referring to materially different governed consequences?

If so, I want to know whether V2 can distinguish “same executable shape” from “same authorized decision object.”

Those feel genuinely different from the findings we already have:

temporal continuity,
governing provenance,
and causal boundary enforcement.

If V2 survives or cleanly bounds those three as well, I think I would be comfortable freezing my independent assessment and only then looking at what the other reviewers found.

Still V2 only.

No solutions added to help it survive.
Kelly Newsome sent the following message at 1:57 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 1:57 PM

Yes. Run all three.

I agree that each is sufficiently different from what you’ve already established to be worth testing independently.

Replay asks whether a valid authority artifact can escape the governed state in which it was created and remain executable elsewhere.

Policy/scenario drift asks whether the governing context can change while an already-created boundary continues to carry the old authority forward.

And boundary identity asks something different again: whether operational equivalence at the execution layer necessarily means equivalence of the authorized decision being represented.

I especially like the distinction between “same executable shape” and “same authorized decision object.” That feels like exactly the kind of assumption we should test rather than make.

Please approach all three exactly as you have the others: hold everything else constant as far as the implementation permits, change the thing under attack, and classify what V2 actually discriminates rather than what we think it ought to discriminate.

And if one of these turns out not to be independently testable because the representation collapses it into something we’ve already found, I think that is a result too. Don’t manufacture a distinction just because we named one.

After those three, if you consider your V2 assessment exhausted, let’s freeze your findings before I show you anything from the other reviewers. Then we can compare the independent assessments without contaminating yours.

Still V2 only. No changes to help it survive. No rescue from anything downstream.
Wojciech Zygmunt Kaleta, 🎓 PhD sent the following message at 3:08 PM
View Wojciech Zygmunt’s profile Wojciech Zygmunt Kaleta, 🎓 PhD
Wojciech Zygmunt Kaleta, 🎓 PhD
3:08 PM

Kelly — I’ve finished the three remaining attacks, and I think my independent V2 assessment is now exhausted.
Replay produced a useful but not wholly independent result. The official ReplayEngine does not reuse a previously issued boundary; it reconstructs the inputs and reruns the governed chain, so deterministic replay itself does not bypass authority generation. But the execution representation does not independently bind an enforceable boundary to the run or authority epoch in which it was created. I see that as another manifestation of the continuity/provenance boundary rather than a new failure.
Policy/scenario drift collapses completely into the finding we already have. V2 records scenarioVersion and policyVersion, but execution does not consume them as predicates. So I would not create a separate finding for it.
The decision-object attack is different. V2 represents the authorized object operationally through action type, scope and enforceable conditions. There is no separate execution-level variable for semantic decision-object identity. So “same executable shape but different authorized decision object” cannot be independently discriminated inside V2 without adding a distinction V2 does not currently represent.
I would classify that as a representation boundary, not a failure.
At this point I do not see another meaningful attack that stays inside V2’s claims without either repeating the findings we already have or importing an upstream solution.
So I’m ready to freeze my independent assessment here.
I would preserve the record as:
SURVIVES — causal boundary enforcement.
SURVIVES — non-ACTIVE authority cannot create a new executable boundary.
SURVIVES — execution retains distinct reasons for BLOCK.
CANNOT DISCRIMINATE — continuing validity of authority after a valid boundary has been created.
CANNOT DISCRIMINATE — recorded authority provenance becoming governing after boundary creation.
REPLAY — governed deterministic replay regenerates the authority/boundary chain, while the boundary representation itself is not independently bound to its originating run or authority epoch.
NOT INDEPENDENT — policy/scenario drift is subsumed by the governing-provenance finding.
REPRESENTATION BOUNDARY — semantic decision-object identity is not separable from executable boundary identity in V2.
KNOWN LIMIT — correct enforcement does not establish that the organization specified the correct authority boundary.
I would freeze those before seeing anything from the other reviewers.
No V3 interpretation yet. No retrospective repair of V2.
Now I’m ready to see what they found.
Seen by Wojciech Zygmunt Kaleta, 🎓 PhD at 3:08 PM.
Kelly Newsome sent the following messages at 8:49 PM
View Kelly’s profile Kelly Newsome
Kelly Newsome (He/Him) 8:49 PM

    ❤️
    👏
    👍

Wojciech — agreed. Let’s freeze your independent V2 assessment exactly here before I show you anything from anyone else.

I think you’ve drawn the boundary around V2 very cleanly, particularly by refusing to manufacture additional findings where the attacks collapse into something already established.

So my understanding of your frozen assessment is:

SURVIVES — causal boundary enforcement.

SURVIVES — non-ACTIVE authority cannot create a new executable boundary.

SURVIVES — execution retains distinct reasons for BLOCK.

CANNOT DISCRIMINATE — continuing validity of authority after a valid boundary has been created.

CANNOT DISCRIMINATE — recorded authority provenance becoming governing after boundary creation.

REPLAY — governed deterministic replay regenerates the authority/boundary chain, but the boundary representation itself is not independently bound to its originating run or authority epoch.

NOT INDEPENDENT — policy/scenario drift is subsumed by the governing-provenance finding.

REPRESENTATION BOUNDARY — semantic decision-object identity is not independently separable from executable boundary identity in V2.

KNOWN LIMIT — correct enforcement does not establish that the organization specified the correct authority boundary.

And importantly, none of those findings requires us to retrospectively change what V2 demonstrated. They tell us where its demonstrated claims stop.

I’m going to preserve this as your frozen independent V2 assessment before we compare it with anything anyone else found.

Once that record is frozen, I’ll show you the other independent work. Then I think the interesting exercise becomes comparison rather than adjudication: where you independently converged, where the reviews diverged, and whether those differences expose additional research questions.

Thank you for attacking the model rather than trying to help it pass. That was exactly what I needed.