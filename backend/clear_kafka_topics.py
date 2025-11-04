#!/usr/bin/env python3
"""
Utility script to clear/reset Kafka topic data.
Useful when you want to start fresh without old buffered messages.
"""
import asyncio
from aiokafka.admin import AIOKafkaAdminClient, NewTopic
from constants import KAFKA_BOOTSTRAP, RAW_PACKETS_TOPIC, PROCESSED_DATA_TOPIC, RECORDING_EVENTS_TOPIC


async def delete_and_recreate_topics():
    """Delete existing topics and recreate them fresh"""
    admin_client = AIOKafkaAdminClient(bootstrap_servers=KAFKA_BOOTSTRAP)
    
    try:
        await admin_client.start()
        print(f"Connected to Kafka at {KAFKA_BOOTSTRAP}")
        
        topics_to_clear = [RAW_PACKETS_TOPIC, PROCESSED_DATA_TOPIC, RECORDING_EVENTS_TOPIC]
        
        # Delete existing topics
        print(f"\n🗑️  Deleting topics: {topics_to_clear}")
        try:
            await admin_client.delete_topics(topics_to_clear)
            print("✓ Topics deleted")
            # Wait a moment for deletion to propagate
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Note: Could not delete topics (may not exist yet): {e}")
        
        # Recreate topics fresh
        print(f"\n📝 Recreating topics fresh...")
        new_topics = [
            NewTopic(name=RAW_PACKETS_TOPIC, num_partitions=1, replication_factor=1),
            NewTopic(name=PROCESSED_DATA_TOPIC, num_partitions=1, replication_factor=1),
            NewTopic(name=RECORDING_EVENTS_TOPIC, num_partitions=1, replication_factor=1),
        ]
        
        try:
            await admin_client.create_topics(new_topics)
            print("✓ Topics recreated successfully")
        except Exception as e:
            print(f"Note: Topics may already exist: {e}")
        
        print(f"\n✅ Done! All topics cleared and ready for fresh data.")
        print(f"\nTopics cleared:")
        for topic in topics_to_clear:
            print(f"  • {topic}")
            
    finally:
        await admin_client.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Kafka Topic Reset Utility")
    print("=" * 60)
    print("\nThis will DELETE all messages in the following topics:")
    print(f"  • {RAW_PACKETS_TOPIC}")
    print(f"  • {PROCESSED_DATA_TOPIC}")
    print(f"  • {RECORDING_EVENTS_TOPIC}")
    print("\n⚠️  This action cannot be undone!")
    
    response = input("\nContinue? (yes/no): ").strip().lower()
    
    if response == "yes":
        asyncio.run(delete_and_recreate_topics())
    else:
        print("Cancelled.")
