<template>
    <ListView for="(record, index) in records" class="list-group" row="1" col="0">
        <v-template>
            <GridLayout columns="*, 50, 60" rows="*" width="100%" height="100%">
                <DockLayout stretchLastChild="false">
                    <Label dock="top" height="40" col="0" row="0" :text="record.noteText" />
                    <Label dock="top" height="40" col="0" row="1" :text="record.time" />
                </DockLayout>
                <Image col="1" row="0" rowSpan="2" :src="record.photo" height="75" />
                <button col="2" row="0" rowSpan="2" height="50%" @tap="$emit('delete', record.time)" class="btn btn-primary">
                    <span class="fa" text.decode="&#xf1f8;"></span>
                </button>

            </GridLayout>
        </v-template>
    </ListView>
</template>
<script>
    export default {
        data() {
            return {};
        },
        props: {
            records: Array,
        },
        methods: {}
    };
</script>