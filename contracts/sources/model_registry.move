/// ModelRegistry - Registry for AI models with metadata on-chain and model storage in Walrus
/// Anyone can upload a model record, storing metadata + Walrus references
module model_registry::registry {
    use sui::event;
    use sui::table::Table;
    use std::string::String;
    use sui::clock::Clock;

    /// Error codes
    const EBlobIdEmpty: u64 = 0;
    const EObjectIdEmpty: u64 = 1;
    const EBlobIdAlreadyExists: u64 = 2;
    const EModelNotFound: u64 = 3;
    const ENotUploader: u64 = 4;

    /// Struct representing a model record
    public struct Model has store, copy, drop {
        uploader: address,          // uploader address
        uploaded_at: u64,           // unix timestamp in milliseconds
        name: String,               // model name
        description: String,        // model description
        blob_id: String,            // walrus blob id (client-generated unique identifier)
        object_id: String,          // walrus object id (returned by walrus storage)
    }

    /// The registry object that stores all models
    public struct ModelRegistry has key {
        id: sui::object::UID,
        models: Table<String, Model>,       // blob_id -> Model mapping
        blob_ids: vector<String>,            // list of all blob_ids
    }

    /// Event emitted when a new model is uploaded
    public struct ModelUploaded has copy, drop {
        blob_id: String,
        uploader: address,
        uploaded_at: u64,
        name: String,
        description: String,
        object_id: String,
    }

    /// Event emitted when metadata is updated
    public struct ModelUpdated has copy, drop {
        blob_id: String,
        name: String,
        description: String,
        object_id: String,
    }

    /// Initialize the registry (called once during deployment)
    fun init(ctx: &mut sui::tx_context::TxContext) {
        let registry = ModelRegistry {
            id: sui::object::new(ctx),
            models: sui::table::new(ctx),
            blob_ids: std::vector::empty<String>(),
        };
        sui::transfer::share_object(registry);
    }

    /// Upload a new model record
    /// @param registry: the shared ModelRegistry object
    /// @param blob_id: unique identifier generated client-side
    /// @param object_id: identifier returned from Walrus storage
    /// @param name: human-readable model name
    /// @param description: short description
    /// @param clock: shared clock object for timestamp
    /// @param ctx: transaction context
    entry fun upload_model(
        registry: &mut ModelRegistry,
        blob_id: String,
        object_id: String,
        name: String,
        description: String,
        clock: &Clock,
        ctx: &sui::tx_context::TxContext
    ) {
        // Validate inputs
        assert!(std::string::length(&blob_id) > 0, EBlobIdEmpty);
        assert!(std::string::length(&object_id) > 0, EObjectIdEmpty);
        assert!(!sui::table::contains(&registry.models, blob_id), EBlobIdAlreadyExists);

        let uploader = sui::tx_context::sender(ctx);
        let uploaded_at = sui::clock::timestamp_ms(clock);

        // Create model record
        let model = Model {
            uploader,
            uploaded_at,
            name,
            description,
            blob_id,
            object_id,
        };

        // Store model
        sui::table::add(&mut registry.models, blob_id, model);
        std::vector::push_back(&mut registry.blob_ids, blob_id);

        // Emit event
        event::emit(ModelUploaded {
            blob_id,
            uploader,
            uploaded_at,
            name,
            description,
            object_id,
        });
    }

    /// Get full metadata by blob_id
    /// @param registry: the shared ModelRegistry object
    /// @param blob_id: the blob_id to query
    /// @return Model struct containing all metadata
    public fun get_metadata(
        registry: &ModelRegistry,
        blob_id: String
    ): Model {
        assert!(sui::table::contains(&registry.models, blob_id), EModelNotFound);
        *sui::table::borrow(&registry.models, blob_id)
    }

    /// Get all blob_ids
    /// @param registry: the shared ModelRegistry object
    /// @return vector of all blob_ids
    public fun get_all_blob_ids(registry: &ModelRegistry): vector<String> {
        registry.blob_ids
    }

    /// Check if a blob_id exists
    /// @param registry: the shared ModelRegistry object
    /// @param blob_id: the blob_id to check
    /// @return true if exists, false otherwise
    public fun exists(registry: &ModelRegistry, blob_id: String): bool {
        sui::table::contains(&registry.models, blob_id)
    }

    /// Get total number of models stored
    /// @param registry: the shared ModelRegistry object
    /// @return total number of models
    public fun total_models(registry: &ModelRegistry): u64 {
        std::vector::length(&registry.blob_ids)
    }

    /// Update metadata for an existing model (only uploader can do this)
    /// @param registry: the shared ModelRegistry object
    /// @param blob_id: the blob_id to update
    /// @param new_name: new model name
    /// @param new_description: new model description
    /// @param new_object_id: new walrus object id
    /// @param ctx: transaction context
    entry fun update_metadata(
        registry: &mut ModelRegistry,
        blob_id: String,
        new_name: String,
        new_description: String,
        new_object_id: String,
        ctx: &sui::tx_context::TxContext
    ) {
        assert!(sui::table::contains(&registry.models, blob_id), EModelNotFound);
        
        let model = sui::table::borrow_mut(&mut registry.models, blob_id);
        assert!(model.uploader == sui::tx_context::sender(ctx), ENotUploader);

        // Update metadata
        model.name = new_name;
        model.description = new_description;
        model.object_id = new_object_id;

        // Emit event
        event::emit(ModelUpdated {
            blob_id,
            name: new_name,
            description: new_description,
            object_id: new_object_id,
        });
    }

    // === Getter functions for Model struct ===

    /// Get the uploader address of a model
    public fun model_uploader(model: &Model): address {
        model.uploader
    }

    /// Get the upload timestamp of a model
    public fun model_uploaded_at(model: &Model): u64 {
        model.uploaded_at
    }

    /// Get the name of a model
    public fun model_name(model: &Model): String {
        model.name
    }

    /// Get the description of a model
    public fun model_description(model: &Model): String {
        model.description
    }

    /// Get the blob_id of a model
    public fun model_blob_id(model: &Model): String {
        model.blob_id
    }

    /// Get the object_id of a model
    public fun model_object_id(model: &Model): String {
        model.object_id
    }

    #[test_only]
    /// Test-only function to initialize registry for testing
    public fun init_for_testing(ctx: &mut sui::tx_context::TxContext) {
        init(ctx);
    }
}
