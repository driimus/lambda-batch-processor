import type { LexV2Event } from 'aws-lambda';
import { Factory } from 'fishery';

export const lexV2EventFactory = Factory.define<LexV2Event>(() => {
  return {
    sessionId: '254688924456798',
    inputTranscript: '01/01/1990',
    interpretations: [
      {
        intent: {
          slots: {
            dateofBirth: {
              shape: 'Scalar',
              value: {
                originalValue: '01/01/1990',
                resolvedValues: ['1990-01-01'],
                interpretedValue: '1990-01-01',
              },
            },
            accountType: {
              shape: 'Scalar',
              value: {
                originalValue: 'savings',
                resolvedValues: ['Savings'],
                interpretedValue: 'Savings',
              },
            },
          },
          confirmationState: 'None',
          name: 'CheckBalance',
          state: 'ReadyForFulfillment',
        },
        nluConfidence: 1,
      },
      {
        intent: {
          slots: {},
          confirmationState: 'None',
          name: 'FallbackIntent',
          state: 'ReadyForFulfillment',
        },
      },
      {
        intent: {
          slots: {},
          confirmationState: 'None',
          name: 'Welcome',
          state: 'ReadyForFulfillment',
        },
        nluConfidence: 0.23,
      },
    ],
    responseContentType: 'text/plain; charset=utf-8',
    sessionState: {
      sessionAttributes: {},
      activeContexts: [],
      intent: {
        slots: {
          dateofBirth: {
            shape: 'Scalar',
            value: {
              originalValue: '01/01/1990',
              resolvedValues: ['1990-01-01'],
              interpretedValue: '1990-01-01',
            },
          },
          accountType: {
            shape: 'Scalar',
            value: {
              originalValue: 'savings',
              resolvedValues: ['Savings'],
              interpretedValue: 'Savings',
            },
          },
        },
        confirmationState: 'None',
        name: 'CheckBalance',
        state: 'ReadyForFulfillment',
      },
      originatingRequestId: 'f57dfc3f-44be-4df9-ae72-9681fc14e67f',
    },
    messageVersion: '1.0',
    invocationSource: 'FulfillmentCodeHook',
    transcriptions: [
      {
        transcription: '01/01/1990',
        transcriptionConfidence: 1,
        resolvedSlots: {
          dateofBirth: {
            shape: 'Scalar',
            value: {
              originalValue: '01/01/1990',
              resolvedValues: ['1990-01-01'],
            },
          },
        },
        resolvedContext: {
          intent: 'CheckBalance',
        },
      },
    ],
    inputMode: 'Text',
    bot: {
      aliasName: 'TestBotAlias',
      aliasId: 'TSTALIASID',
      name: 'BankingBot',
      version: 'DRAFT',
      localeId: 'en_US',
      id: 'J866BA0UQC',
    },
    proposedNextState: {
      dialogAction: { type: 'ConfirmIntent' },
      intent: {
        slots: {},
        confirmationState: 'None',
        name: 'FallbackIntent',
        state: 'ReadyForFulfillment',
      },
    },
  };
});
