# Serialization

Serialization is rather confusing.
This document is supposed to make things slightly easier to understand.

## Terminology

There's a lot of very general concepts
that seem similar but aren't
and consistently naming them is important but challenging.

This document contains the names chosen for various things.
They might not be the best names,
but at least they are definitive and consistent.

Some code may use the wrong name,
since this document was written after some of the code,
and it may not have been updated correctly.

## Entity

The base item involved in serialization,
which contains all the others.

## Item

An object or array,
potentially containing or referencing other objects or arrays.
Can exist before and after serialization.

## Key

A string, number, or symbol indexing an _attribute_ in an _item_.
Note numbers are treated as strings,
since JavaScript converts them for indexing purposes anyways.

## Attribute

The value of an _item_ associated with some _key_.

## Serializable

Something that can be serialized,
but hasn't been yet.
Equivalent to _deserialized_,
other than which stage in the process it is.

## Deserialized

Something that has been deserialized.
Equivalent to _serializable_,
other than which stage in the process it is.

## Serialized

Something in its serialized form.

## Serializer

The object that collects information about the program,
and uses it to serialize data.

## Serialization

The object (and process) that serializes data.
Exists only briefly and is used to cache data
about things that it has already serialized.

## Deserialization

The object (and process) that deserializes data.
Exists only briefly and is used to cache data
about things that it has already deserialized.
