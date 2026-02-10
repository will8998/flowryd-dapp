# Flowryd → IntellectEU
## Technical Validation & MVP Deployment Scoping Request

**Date:** January 31, 2026  
**From:** Liz Towler, Flowryd CEO  
**To:** Chris Kelly / IEU Technical Team  
**Priority:** High - Design partner commitments pending

---

## EXECUTIVE SUMMARY

Flowryd needs IEU to validate and deploy a tight Canton-native MVP that enables:
1. Canton Coin subscription payments (using Chata's shared DAML code)
2. Private Flow Canvas for design partners to model workflows
3. On-chain Flow Offer/Commit mechanics (using Flowryd's existing DAML library)

**Timeline Ask:** Scoping estimate by Feb 7, deployment target by end of Feb 2026

---

## CONTEXT

### What We Have
- **Chata subscription DAML code** - They've agreed to share their subscription contract pattern
- **Flowryd DAML library** - 9 modules, ~2,244 LOC (documented but not yet deployed/validated)
- **Design partner ready** - Texture Capital wants to prototype a DAT tokenization flow
- **Featured App status** - Approved by Canton governance Dec 2025

### What We Need Validated
1. Chata's subscription code works for Flowryd's subscription model
2. Flowryd's DAML library deploys cleanly on Canton TestNet
3. Integration path between subscription → flow creation → offer/commit

---

## SCOPE OF WORK

### PHASE 1: Code Review & Validation (Week 1-2)

#### 1.1 Chata Subscription Code Review
- Review Chata's subscription DAML contract
- Assess fit for Flowryd subscription model:
  - DISCOVER tier: $100/month (or CC equivalent)
  - Monthly recurring pattern
  - Canton Wallet payment integration
- Identify modifications needed for Flowryd use case
- Security review

**Deliverable:** Assessment report + modification recommendations

#### 1.2 Flowryd DAML Library Validation
- Review existing Flowryd DAML modules:
  ```
  Data/Types.daml
  Data/ExternalRef.daml
  Workflow/Offer.daml
  Workflow/Signatures.daml
  Workflow/Batch.daml
  Rewards/FeaturedApp.daml
  Party/Connection.daml
  UseCase/Repo.daml
  UseCase/Collateral.daml
  ```
- Deploy to Canton TestNet
- Execute test transactions
- Identify bugs, gaps, or issues

**Deliverable:** TestNet deployment + test results + issue log

#### 1.3 Integration Assessment
- How subscription contract triggers access to Flow creation
- Party-ID verification flow
- Canton Wallet integration points

**Deliverable:** Integration architecture diagram + implementation notes

---

### PHASE 2: MVP Deployment (Week 3-4)

#### 2.1 Subscription Contract Deployment
- Adapt Chata code for Flowryd
- Deploy subscription contract to TestNet
- Test CC payment → subscription creation flow
- Configure for $100/month equivalent

#### 2.2 Flow Offer/Commit Deployment
- Deploy Workflow/Offer.daml patterns
- Deploy Party/Connection.daml for party management
- Test offer creation → send → accept/counter/decline cycle
- Validate multi-party signature coordination

#### 2.3 Private Canvas Backend
- Contract for creating private flows (draft state)
- Adding/removing party roles to flow
- Identifying "GAP" roles vs "FILLED" roles
- Publishing offers to GAP role candidates

**Deliverable:** Working TestNet environment with core MVP contracts

---

### PHASE 3: Design Partner Pilot (Week 5-6)

#### 3.1 Texture Capital Onboarding
- Configure Texture's Party-ID
- Deploy their first private flow (DAT Tokenization)
- Support first Flow Offer sent to candidate parties
- Track commits through to activation

#### 3.2 2-3 Additional Design Partners
- Repeat onboarding for additional partners
- Different flow types to stress-test patterns

**Deliverable:** 2-3 live design partner flows on TestNet

---

## TECHNICAL QUESTIONS FOR IEU

### On Chata Code
1. Have you seen their subscription pattern before?
2. Estimated effort to adapt for Flowryd's model?
3. Any concerns about licensing/usage rights?

### On Flowryd Library
1. Can you review the existing documentation package? (I'll share)
2. Typical time to deploy 9-module library to TestNet?
3. Do you see any obvious issues with the architecture?

### On Integration
1. Standard pattern for subscription → access control on Canton?
2. Canton Wallet integration - any gotchas?
3. Party-ID verification - C7 Trust integration or simpler path for MVP?

### On Timeline
1. Team availability for Feb?
2. Can we start Phase 1 next week if code arrives?
3. Preferred engagement model - fixed scope or T&M?

---

## WHAT FLOWRYD PROVIDES

- [ ] Chata subscription DAML code (upon receipt)
- [ ] Flowryd DAML library documentation package (attached)
- [ ] Flowryd DAML source code files
- [ ] Texture Capital use case specification
- [ ] Design partner flow requirements
- [ ] Access to any existing TestNet setup (if applicable)

---

## COMMERCIAL DISCUSSION

### Existing Relationship Context
- IEU quoted $8K/month post-launch for ongoing support
- $150/hour for development work
- Pinar/7RIDGE relationship

### This Request
Please provide:
1. **Phase 1 estimate** (Code Review & Validation)
2. **Phase 2 estimate** (MVP Deployment)
3. **Phase 3 estimate** (Design Partner Support)
4. **Ongoing support model** for post-MVP

We're open to:
- Fixed scope for Phase 1-2
- T&M for Phase 3 (variable based on partner count)
- Retainer for ongoing

---

## SUCCESS CRITERIA

**MVP is successful when:**
- [ ] Texture Capital subscribes via Canton Coin
- [ ] Texture creates private DAT Tokenization flow
- [ ] Texture sends Flow Offer to candidate Crypto Custodian
- [ ] Candidate receives offer and can Accept/Counter/Decline
- [ ] Commit tracked in Flowryd dashboard
- [ ] All transactions on Canton (TestNet initially, MainNet path clear)

---

## NEXT STEPS

1. **Liz:** Send Chata code + Flowryd library docs to IEU (pending Chata handoff)
2. **IEU:** Review and provide scoping estimate (target: Feb 7)
3. **Both:** Align on timeline and commercial terms
4. **Kick-off:** Target week of Feb 10

---

## ATTACHMENTS

*To be sent separately:*
- FLOWRYD_DAML_LIBRARY_GUIDE.md
- FLOWRYD_QUICK_REFERENCE.md
- Flowryd DAML source files
- Chata subscription code (when received)
- Texture Design Partner deck (for context)

---

**Contact:**  
Liz Towler  
liz@flowryd.com  
Flowryd Ltd.

---

*This document is confidential and intended for IntellectEU technical team.*
