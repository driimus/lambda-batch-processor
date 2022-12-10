import type { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { Factory } from 'fishery';

class DynamoDBRecordFactory extends Factory<DynamoDBRecord> {
  insert() {
    return this.params({
      eventName: 'INSERT',
      dynamodb: {
        Keys: {
          Id: {
            N: '101',
          },
        },
        NewImage: {
          Message: {
            S: 'New item!',
          },
          Id: {
            N: '101',
          },
        },
        StreamViewType: 'NEW_AND_OLD_IMAGES',
        SequenceNumber: this.sequence().toString(),
        SizeBytes: 26,
      },
    });
  }

  modify() {
    return this.params({
      eventName: 'MODIFY',
      dynamodb: {
        Keys: {
          Id: {
            N: '101',
          },
        },
        OldImage: {
          Message: {
            S: 'New item!',
          },
          Id: {
            N: '101',
          },
        },
        NewImage: {
          Message: {
            S: 'This item has changed',
          },
          Id: {
            N: '101',
          },
        },
        SequenceNumber: this.sequence().toString(),
        SizeBytes: 59,
        StreamViewType: 'NEW_AND_OLD_IMAGES',
      },
    });
  }

  delete() {
    return this.params({
      eventName: 'REMOVE',
      dynamodb: {
        Keys: {
          Id: {
            N: '101',
          },
        },
        OldImage: {
          Message: {
            S: 'This item has changed',
          },
          Id: {
            N: '101',
          },
        },
        SequenceNumber: this.sequence().toString(),
        SizeBytes: 39,
        StreamViewType: 'NEW_AND_OLD_IMAGES',
      },
    });
  }
}

export const dynamodbRecordFactory = DynamoDBRecordFactory.define(({ sequence }) => {
  return {
    eventID: sequence.toString(),
    eventVersion: '1.0',
    dynamodb: {
      Keys: {
        Id: {
          N: '101',
        },
      },
      NewImage: {
        Message: {
          S: 'New item!',
        },
        Id: {
          N: '101',
        },
      },
      StreamViewType: 'NEW_AND_OLD_IMAGES',
      SequenceNumber: sequence.toString(),
      SizeBytes: 26,
    },
    awsRegion: 'us-west-2',
    eventName: 'INSERT',
    eventSourceARN:
      'arn:aws:dynamodb:us-west-2:111122223333:table/TestTable/stream/2015-05-11T21:21:33.291',
    eventSource: 'aws:dynamodb',
  } as const;
});

export const dynamodbEventFactory = Factory.define<DynamoDBStreamEvent>(() => {
  return { Records: dynamodbRecordFactory.buildList(1) };
});
