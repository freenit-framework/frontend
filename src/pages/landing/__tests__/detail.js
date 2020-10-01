import React from 'react'
import { mount } from 'enzyme'
import TestApp from '../../../TestApp'


it('landing', async () => {
  const wrapper = await mount(<TestApp path="/" />)
  let title = wrapper.find('h1')
  expect(title.text()).toEqual('Freenit Framework')
})
