const Publication = require('../models/publication')
const User = require('../models/user')
const Follow = require('../models/follow')
const { v4: uuidv4 } = require('uuid')

async function publish(publication, ctx) {
  const { id } = ctx.user;


  const newPublication = new Publication({
    idUser: ctx.user.id,
    file: publication,
    typeFile: publication.split('/')[0],
    createAt: Date.now()
  })

  await newPublication.save()

  return {
    status: true,
    file: publication
  }

}


async function getPublications(username) {

  const user = await User.findOne({username})


  if(!user) throw new Error('User not found')

  const publications = await Publication.find().where({ idUser: user._id }).sort({createAt: -1}).limit(10)


  return publications
}


async function getPublicationsFolloweds(ctx) {
  
  const followeds = await Follow.find({idUser: ctx.user.id}).populate('follow')

  const followedsList = []
  for await (const data of  followeds) {
    followedsList.push(data.follow)
  }

  const publicationList = []
  for await (const data of followedsList) {
    const publications = await Publication.find().where({idUser: data._id}).sort({createAt: -1}).populate('idUser')

    publicationList.push(...publications)
  }

  const result = publicationList.sort((a, b) => {
    return new Date(b.createAt) - new Date(a.createAt)
  })

  return result
}

module.exports = {
  publish,
  getPublications,
  getPublicationsFolloweds
}