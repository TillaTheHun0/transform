'use strict'

import { expect } from 'chai'
import { FieldPermissionLvl } from '../../src'
import { PassthroughFieldMapper, CustomFieldMapper, SubTransformFieldMapper } from '../../src/fieldMapper'
import { FieldMapperDelegate } from '../../src/field.mapper.delegate'

function always () {
  let delegate = new FieldMapperDelegate('woop')

  delegate.always()

  expect(delegate._always).to.be.equal(true)

  delegate.passthrough()

  expect(delegate._always).to.be.equal(null)
}

function alwaysSetsAllLvls () {
  let fMDelegate = new FieldMapperDelegate('woop')

  fMDelegate.always().passthrough()

  fMDelegate.permissionRanking.forEach((p) => {
    expect(fMDelegate.delegate[p]).to.not.be.equal(null)
    expect(fMDelegate.delegate[p]).to.not.be.equal(undefined)
  })
}

function passthroughAlways () {
  let fMDelegate = new FieldMapperDelegate('woop')

  fMDelegate.always().passthrough()

  fMDelegate.permissionRanking.forEach((p) => {
    expect(fMDelegate.delegate[p] instanceof PassthroughFieldMapper).to.be.equal(true)
  })

  expect(fMDelegate.curPermissionLvl).to.be.equal(null)
}

function buildWithAlways () {
  let fMDelegate = new FieldMapperDelegate('woop')
  let builder = () => {
    console.log('builder')
  }

  fMDelegate.always().buildWith(builder)

  fMDelegate.permissionRanking.forEach((p) => {
    expect(fMDelegate.delegate[p] instanceof CustomFieldMapper).to.be.equal(true)
  })

  expect(fMDelegate.curPermissionLvl).to.be.equal(null)
}

function subTransformWithPermission () {
  let fMDelegate = new FieldMapperDelegate('woop')

  fMDelegate.always().subTransform('something', FieldPermissionLvl.PUBLIC)

  fMDelegate.permissionRanking.forEach((p) => {
    let trans = fMDelegate.delegate[p]
    expect(fMDelegate.delegate[p] instanceof SubTransformFieldMapper).to.be.equal(true)
    expect(trans.permission).to.be.equal(FieldPermissionLvl.PUBLIC)
  })

  expect(fMDelegate.curPermissionLvl).to.be.equal(null)
}

function subTransformWithoutPermission () {
  let fMDelegate = new FieldMapperDelegate('woop')

  fMDelegate.always().subTransform('something')

  fMDelegate.permissionRanking.forEach((p) => {
    let trans = fMDelegate.delegate[p]
    expect(fMDelegate.delegate[p] instanceof SubTransformFieldMapper).to.be.equal(true)
    expect(trans.permission).to.be.equal(p)
  })

  expect(fMDelegate.curPermissionLvl).to.be.equal(null)
}

function asList () {
  let fMDelegate = new FieldMapperDelegate('woop').asList()
  expect(fMDelegate.isList).to.be.equal(true)
}

function checkAlways () {
  let fMDelegate = new FieldMapperDelegate('woop')

  fMDelegate.always().passthrough()

  fMDelegate.permissionRanking.forEach((p) => {
    expect(fMDelegate.delegate[p] instanceof PassthroughFieldMapper).to.be.equal(true)
  })

  expect(fMDelegate._always).to.be.equal(null)
}

function restrict () {
  let fMDelegate = new FieldMapperDelegate('woop')

  let index = fMDelegate.permissionRanking.indexOf(FieldPermissionLvl.PRIVATE)
  fMDelegate.restrictToPrivate().passthrough()

  fMDelegate.permissionRanking.forEach((p, i) => {
    if (i < index) {
      expect(fMDelegate.delegate[p]).to.be.equal(null)
      return
    }
    expect(fMDelegate.delegate[p] instanceof PassthroughFieldMapper).to.be.equal(true)
  })
}

function transformAtLvl () {
  let fMDelegate = new FieldMapperDelegate('woop')
  let obj = {
    woop: 200
  }

  fMDelegate.restrictToPrivate().passthrough()

  fMDelegate.transform(FieldPermissionLvl.PRIVATE, obj).then((value) => {
    expect(value).to.be.equal(200)
  })
}

function transformBelowLvl () {
  let fMDelegate = new FieldMapperDelegate('woop')
  let obj = {
    woop: 200
  }

  fMDelegate.restrictToPrivate().passthrough()

  fMDelegate.transform(FieldPermissionLvl.PUBLIC, obj).then((value) => {
    expect(value).to.be.equal(undefined)
  })
}

function when () {
  let fMDelegate = new FieldMapperDelegate('woop').whenPrivate()

  expect(fMDelegate.curPermissionLvl).to.be.equal(FieldPermissionLvl.PRIVATE)
}

function restrictTo () {
  let fMDelegate = new FieldMapperDelegate('woop')

  let index = fMDelegate.permissionRanking.indexOf(FieldPermissionLvl.PRIVATE)
  fMDelegate.restrictToPrivate()

  expect(fMDelegate.curPermissionLvl).to.be.equal(FieldPermissionLvl.PRIVATE)
  expect(index).to.be.equal(fMDelegate.restriction)
}

function setPermissionRanking () {
  let permissions = ['low', 'medium', 'high']

  let fMDelegate = new FieldMapperDelegate('woop', permissions)

  expect(fMDelegate.permissionRanking).has.members(permissions)
}

function buildPermissionMethods () {
  let permissions = ['low', 'medium', 'high']

  let fMDelegate = new FieldMapperDelegate('woop', permissions)

  let capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)
  }

  permissions.forEach((p) => {
    let m = fMDelegate[`restrictTo${capitalize(p)}`]
    expect(m).to.not.be.equal(null)
    expect(m).to.not.be.equal(undefined)
  })

  permissions.forEach((p) => {
    let m = fMDelegate[`when${capitalize(p)}`]
    expect(m).to.not.be.equal(null)
    expect(m).to.not.be.equal(undefined)
  })
}

function oldApiThrowsErr () {
  try {
    let permissions = ['low', 'medium', 'high']

    let fMDelegate = new FieldMapperDelegate('woop', permissions)

    fMDelegate.whenPrivate()
    throw new Error('Should have thrown error using old API')
  } catch (err) {
    expect(err).to.not.be.equal(null)
  }
}

export {
  always,
  alwaysSetsAllLvls,
  passthroughAlways,
  buildWithAlways,
  subTransformWithPermission,
  subTransformWithoutPermission,
  asList,
  checkAlways,
  restrict,
  transformAtLvl,
  transformBelowLvl,
  when,
  restrictTo,
  setPermissionRanking,
  buildPermissionMethods,
  oldApiThrowsErr
}