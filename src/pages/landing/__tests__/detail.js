import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp from '../../../TestApp'


it('landing', async () => {
  let wrapper
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/" />
    )
  })
  let title = wrapper.find('h1')
  expect(title.text()).toEqual('Freenit Framework')
})
