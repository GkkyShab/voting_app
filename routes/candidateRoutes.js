const express = require("express");
const Candidate = require("../models/Candidate");
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const User = require("../models/user");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};

//POST route to add a person
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "You are not a admin" });
    }
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log("data saved");

    res.status(200).send({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//PUT/PATCH Method API to update candidate Records
router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "You are not a admin" });
    }
    const candidateID = req.params.candidateID;
    const candidateUpdatedData = req.body;
    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      candidateUpdatedData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!response) {
      return res.status(404).json({ error: "Candidate Not Found" });
    }
    console.log("Candidate Data Updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//Delete Candidate
router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "You are not a admin" });
    }
    const candidateID = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ error: "Candidate Not Found" });
    }
    console.log("Candidate Deleted Successfully");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  const candidateID = req.params.candidateID;
  const userId = req.user.id;
  try {
    //find candidate
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(400).json({ message: "Candidate Not Found" });
    }
    //find user
    const user = await User.findById(userId);
    //user can vote once
    if (user.isVoted) {
      return res.status(403).json({ message: "You have already voted" });
    }
    //no admin can vote
    if (user.role === "admin") {
      return res.status(403).json({ message: "You are admin you can't vote" });
    }

    candidate.votes.push({user:userId});
    candidate.voteCount++;
    await candidate.save();

    //update user doc..
    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "Vote saved successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//vote count
router.get("/vote/count",async(req,res)=>{
  try{
    //Find all the candidate and sort them by votecount in descending order
    const candidate = await Candidate.find().sort({voteCount:'desc'});
    //Map the candidate to only return their name and voteCount
    const voteRecord = candidate.map((data)=>{
      return{
        party : data.party,
        count: data.voteCount
      }
    })
    return res.status(200).json(voteRecord);
  }catch(err){
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
})

router.get("/candidatelist",async(req,res)=>{
  try{
    const candidate = await Candidate.find();
    const candidateList = candidate.map((data)=>{
      return {
        Name: data.name,
        Party: data.party,
        CandidateId: data.id
      }
    })
    return res.status(200).json(candidateList);
  }catch(err){
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
})
module.exports = router;
